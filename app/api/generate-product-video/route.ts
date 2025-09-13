import { db } from "@/configs/firebaseConfig";
import { imagekit } from "@/lib/imagekit";
import { replicate } from "@/lib/replicate";
import { doc, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req: NextResponse) {
    const {imageUrl, imageToVideoPrompt, uid, docId} = await req.json();
    const input = {
        image: imageUrl,
        prompt: imageToVideoPrompt
    };
    //Update Doc
    await updateDoc(doc(db, 'user-ads', docId), {
        imageToVideoStatus: 'pending',
    });

    const output = await replicate.run("minimax/video-01", { input });

    //@ts-ignore
    console.log(output.url());

    //Save to Imagekit
    //@ts-ignore
    const resp = await fetch(output.url());
    const videoBuffer = Buffer.from(await resp.arrayBuffer());

    const uploadResult = await imagekit.upload({
        file: videoBuffer,
        fileName: `video_${Date.now()}.mp4`,
        isPublished: true
    })

    //Update Doc
    await updateDoc(doc(db, 'user-ads', docId), {
        imageToVideoStatus: 'completed',
        videoUrl: uploadResult.url,
    });

    //Update User Credits
    
    //@ts-ignore
    return NextResponse.json(uploadResult.url);
}

// import { NextRequest, NextResponse } from "next/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { imagekit } from "@/lib/imagekit";
// import { doc, updateDoc } from "firebase/firestore";
// import { db } from "@/configs/firebaseConfig";

// // 🔑 init Gemini client
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// // Imagen Video model
// const videoModel = genAI.getGenerativeModel({ model: "veo-3.0-fast-generate-001" });

// async function fetchImageAsBase64(url: string) {
//     const res = await fetch(url);
//     const buffer = await res.arrayBuffer();
//     return Buffer.from(buffer).toString("base64");
// }
  
// export async function POST(req: NextRequest) {
//   try {
//     const { imageUrl, imageToVideoPrompt, uid, docId } = await req.json();

//     if (!imageUrl || !imageToVideoPrompt) {
//       return NextResponse.json(
//         { error: "Missing required fields: imageUrl or imageToVideoPrompt" },
//         { status: 400 }
//       );
//     }

//     //Update Doc
//     await updateDoc(doc(db, 'user-ads', docId), {
//         imageToVideoStatus: 'pending',
//     });

//     // STEP 1: Construct prompt
//     const prompt = `
//       Create a smooth short product ad video.
//       Start with the uploaded product image as the main reference.
//       ${imageToVideoPrompt}
//     `;

//     // STEP 2: Call Imagen Video with prompt + reference image
//     const base64Image = await fetchImageAsBase64(imageUrl);

//     const videoResponse = await videoModel.generateContent([
//         {
//         text: `
//             Create a smooth short product ad video.
//             Start with the uploaded product image as the main reference.
//             ${imageToVideoPrompt}
//         `,
//         },
//         {
//         inlineData: {
//             mimeType: "image/png",
//             data: base64Image, // ⚠️ must be base64, not URL
//         },
//         },
//     ]);
  

//     // STEP 3: Extract base64 video from response
//     const videoBase64 =
//       videoResponse.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

//     if (!videoBase64) {
//       return NextResponse.json(
//         { error: "Gemini did not return video content" },
//         { status: 500 }
//       );
//     }

//     // STEP 4: Upload video to ImageKit
//     const uploadResult = await imagekit.upload({
//       file: `data:video/mp4;base64,${videoBase64}`,
//       fileName: `ad-video-${uid || Date.now()}.mp4`,
//       isPublished: true,
//     });

//     console.log("✅ Video generated & uploaded:", uploadResult.url);

//     //Update Doc
//     await updateDoc(doc(db, 'user-ads', docId), {
//         imageToVideoStatus: 'completed',
//     });

//     return NextResponse.json({
//       success: true,
//       generatedVideoUrl: uploadResult.url,
//     });
//   } catch (error: any) {
//     console.error("❌ Video generation error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
