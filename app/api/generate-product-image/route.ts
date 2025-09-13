// import { NextRequest, NextResponse } from "next/server";
// import { imagekit } from "@/lib/imagekit";
// import { clientOpenAi } from "@/lib/openai";

// const PROMPT = `Create a vibrant product showcase image featuring a uploaded image 
//                 in the center, surrounded by dynamic splashes of liquid or relevant material that complement the product. 
//                 Use a clean, colorful background to make the product stand out. Include subtle elements related to the product
//                 ingredients, or theme floating around to add context and visual interest.
//                 Ensure the product is sharp and in focus, with motion and energy conveyed through the splash effects, 
//                 Also give me image to video prompt for same in JSON format: {textToImage: '', imageToVideo}`

// export async function POST(req:NextRequest) {
//     const formData = await req.formData();
//     const file = formData.get('file') as File;
//     const description = formData.get('description');
//     const size = formData?.get('size');

//     //Upload Product Image
//     const arrayBuffer = await file.arrayBuffer();
//     const base64File = Buffer.from(arrayBuffer).toString('base64');

//     const imageKitRef = await imagekit.upload({
//         file: base64File,
//         fileName: Date.now() + ".png",
//         isPublished: true
//     });

//     console.log(imageKitRef.url);

//     // Generate Product Image Prompt using ChatGPT
//     const response = await clientOpenAi.responses.create({
//         model: "gpt-4.1-mini",
//         input: [
//             {
//                 role: 'user',
//                 content: [
//                     {
//                         type: 'input_text',
//                         text: PROMPT
//                     },
//                     //@ts-ignore
//                     {
//                         type: 'input_image',
//                         image_url: imageKitRef.url
//                     }
//                 ]
//             }
//         ],
//     });

//     const textOutput = response.output_text?.trim();
//     let json = JSON.parse(textOutput);
//     return NextResponse.json(json);
// }

// import { NextRequest, NextResponse } from "next/server";
// import { imagekit } from "@/lib/imagekit";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const PROMPT = `Create a vibrant product showcase image featuring an uploaded image 
//                 in the center, surrounded by dynamic splashes of liquid or relevant material that complement the product. 
//                 Use a clean, colorful background to make the product stand out. Include subtle elements related to the product
//                 ingredients or theme floating around to add context and visual interest.
//                 Ensure the product is sharp and in focus, with motion and energy conveyed through the splash effects. 
//                 Also give me image to video prompt for the same in JSON format: {textToImage: '', imageToVideo: ''}`;

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
// const imageModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });

// export async function POST(req: NextRequest) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get("file") as unknown as File | Blob;
//     const description = formData.get("description");
//     const size = formData.get("size");

//     if (!file || !(file as Blob).arrayBuffer) {
//       return NextResponse.json({ error: "Invalid file upload" }, { status: 400 });
//     }

//     // Upload Product Image to ImageKit
//     const arrayBuffer = await (file as Blob).arrayBuffer();
//     const base64File = Buffer.from(arrayBuffer).toString("base64");
    
//     const imageKitRef = await imagekit.upload({
//       file: base64File,
//       fileName: Date.now() + ".png",
//       isPublished: true,
//     });
    
//     console.log("Image uploaded:", imageKitRef.url);

//     // ✅ Correct Gemini call (no "role", just "parts")
//     const result = await model.generateContent({
//         contents: [
//           {
//             role: "user", // ✅ required in TS typing
//             parts: [
//               { text: PROMPT + `\nProduct description: ${description ?? ""}` },
//               {
//                 inlineData: {
//                   mimeType: "image/png",
//                   data: base64File,
//                 },
//               },
//             ],
//           },
//         ],
//     });

//     let textOutput = result.response.text().trim();

//     const jsonMatch = textOutput.match(/```json([\s\S]*?)```/);
//     if (jsonMatch) {
//       textOutput = jsonMatch[1].trim();
//     } else {
//       // fallback: maybe no fences, just raw JSON
//       const braceMatch = textOutput.match(/\{[\s\S]*\}/);
//       if (braceMatch) {
//         textOutput = braceMatch[0];
//       }
//     }

//     let json;
//     try {
//       json = JSON.parse(textOutput);
//     } catch (e) {
//       console.error("Failed to parse JSON:", textOutput);
//       return NextResponse.json(
//         { error: "Gemini did not return valid JSON", raw: textOutput },
//         { status: 500 }
//       );
//     }

//     //Generate Product Image
//     const imageResponse = await imageModel.generateContent({
//       contents: [
//         {
//           role: "user",
//           parts: [
//             { text: json?.textToImage ?? "Generate a product image" },
//             {
//               fileData: {
//                 mimeType: "image/png",
//                 fileUri: imageKitRef.url, // ✅ use ImageKit uploaded image as reference
//               },
//             },
//           ],
//         },
//       ],
//     });
//     console.log(imageResponse);
//     // Gemini Imagen returns base64 in inlineData
//     const candidates = imageResponse.response.candidates ?? [];
//     const imagePart = candidates[0]?.content?.parts?.find(
//       (p: any) => p.inlineData?.data
//     );

//     if (!imagePart?.inlineData?.data) {
//       return NextResponse.json(
//         { error: "Gemini did not return an image", raw: imageResponse },
//         { status: 500 }
//       );
//     }

//     const generatedImageBase64 = imagePart.inlineData.data;

//     //Upload generated image to Imagekit
//     const uploadResult = await imagekit.upload({
//       file: `data:image/png;base64,${generatedImageBase64}`,
//       fileName: `generate-${Date.now()}.png`,
//       isPublished: true,
//     });

//     //Save to database
//     return NextResponse.json(uploadResult?.url);
//   } catch (error: any) {
//     console.error("Gemini API error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// import { NextRequest, NextResponse } from "next/server";
// import { imagekit } from "@/lib/imagekit";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const PROMPT = `Create a vibrant product showcase ad image featuring an uploaded product photo. 
// The product should be in the center, surrounded by dynamic splashes, effects, or materials that complement it. 
// Use a clean and colorful background to make the product stand out. 
// Include subtle thematic elements floating around to add visual interest.
// Ensure the product is sharp and in focus, with motion and energy conveyed through the effects.
// Now return a JSON object ONLY in this format:
// {"textToImage": "prompt for generating ad image", "imageToVideo": "prompt for turning image into a short ad video"}`;

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// const textModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
// const imageModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });

// export async function POST(req: NextRequest) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get("file") as File;
//     const description = formData.get("description");

//     if (!file) {
//       return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//     }

//     // Upload product image to ImageKit
//     const arrayBuffer = await file.arrayBuffer();
//     const base64File = Buffer.from(arrayBuffer).toString("base64");

//     const imageKitRef = await imagekit.upload({
//       file: base64File,
//       fileName: `product-${Date.now()}.png`,
//       isPublished: true,
//     });

//     console.log("Uploaded product image:", imageKitRef.url);

//     // STEP 1: Generate prompts (JSON)
//     const result = await textModel.generateContent({
//       contents: [
//         {
//           role: "user",
//           parts: [
//             { text: PROMPT + `\nProduct description: ${description ?? ""}` },
//           ],
//         },
//       ],
//     });

//     let textOutput = result.response.text().trim();

//     // Try to extract JSON safely
//     const jsonMatch = textOutput.match(/```json([\s\S]*?)```/);
//     if (jsonMatch) {
//       textOutput = jsonMatch[1].trim();
//     } else {
//       const braceMatch = textOutput.match(/\{[\s\S]*\}/);
//       if (braceMatch) {
//         textOutput = braceMatch[0];
//       }
//     }

//     let json: { textToImage: string; imageToVideo: string };
//     try {
//       json = JSON.parse(textOutput);
//     } catch (e) {
//       console.error("❌ Failed to parse Gemini JSON:", textOutput);
//       return NextResponse.json(
//         { error: "Gemini did not return valid JSON", raw: textOutput },
//         { status: 500 }
//       );
//     }

//     console.log("Generated prompts:", json);

//     // STEP 2: Generate Ad Image
//     const imageResponse = await imageModel.generateContent({
//       contents: [
//         {
//           role: "user",
//           parts: [
//             { text: json.textToImage ?? "Generate a product advertisement image" },
//             {
//               fileData: {
//                 mimeType: "image/png",
//                 fileUri: imageKitRef.url, // reference uploaded product image
//               },
//             },
//           ],
//         },
//       ],
//     });

//     // Extract base64 image
//     const candidates = imageResponse.response.candidates ?? [];
//     const imagePart = candidates[0]?.content?.parts?.find(
//       (p: any) => p.inlineData?.data
//     );

//     if (!imagePart?.inlineData?.data) {
//       return NextResponse.json(
//         { error: "Gemini did not return an image", raw: imageResponse },
//         { status: 500 }
//       );
//     }

//     const generatedImageBase64 = imagePart.inlineData.data;

//     // Upload generated ad image to ImageKit
//     const uploadResult = await imagekit.upload({
//       file: `data:image/png;base64,${generatedImageBase64}`,
//       fileName: `ad-${Date.now()}.png`,
//       isPublished: true,
//     });

//     // Return final result
//     return NextResponse.json({
//       originalImage: imageKitRef.url,
//       adImage: uploadResult.url,
//       prompts: json,
//     });
//   } catch (error: any) {
//     console.error("Gemini API error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

//-works
import { NextRequest, NextResponse } from "next/server";
import { imagekit } from "@/lib/imagekit";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { collection, doc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "@/configs/firebaseConfig";


const PROMPT = `Create a vibrant product showcase image featuring an uploaded product image 
in the center, surrounded by dynamic splashes of liquid or relevant material that complement the product. 
Use a clean, colorful background to make the product stand out. Include subtle elements related to the product
ingredients or theme floating around to add context and visual interest.
Ensure the product is sharp and in focus, with motion and energy conveyed through the splash effects. 
Also give me image-to-video prompt for the same in JSON format: {textToImage: '', imageToVideo: ''}`;

// Init Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Text reasoning model (for JSON prompt generation)
const textModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Image generation model (for final ad image)
const imageModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const description = formData.get("description");
    const size = formData?.get('size');
    const userEmail = formData?.get('userEmail');

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const userRef = collection(db, 'users');
    const q = query(userRef, where('userEmail', '==', userEmail));
    const querySnapshot = await getDocs(q);
    let userInfo;
    if (querySnapshot.empty) {
      console.warn("No user found with email:", userEmail);

      // ✅ Fallback default user object
      userInfo = {
        userEmail,
        plan: "free",
        requestsUsed: 0,
        requestsLimit: 10, // or whatever default you want
        createdAt: new Date().toISOString(),
      };
    } else {
      const userDoc = querySnapshot.docs[0];
      userInfo = userDoc.data();
    }

    //Save to database
    const docId = Date.now().toString();
    await setDoc(doc(db, 'user-ads', docId), {
      userEmail: userEmail,
      status: 'pending',
      description: description,
      size: size 
    });

    // STEP 1: Upload to ImageKit for permanent URL
    const arrayBuffer = await file.arrayBuffer();
    const base64File = Buffer.from(arrayBuffer).toString("base64");

    const imageKitRef = await imagekit.upload({
      file: base64File,
      fileName: Date.now() + ".png",
      isPublished: true,
    });

    console.log("✅ Image uploaded:", imageKitRef.url);

    // STEP 2: Generate JSON prompts using Gemini text model
    const jsonResponse = await textModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                PROMPT +
                `\nProduct description: ${description ?? ""}\nUse the uploaded image as reference.`,
            },
          ],
        },
      ],
    });

    function cleanJsonString(text: string) {
      // Remove ```json fences if they exist
      const withoutFences = text.replace(/```json/gi, "").replace(/```/g, "").trim();

      // Try to find the first { and last }
      const start = withoutFences.indexOf("{");
      const end = withoutFences.lastIndexOf("}");

      if (start === -1 || end === -1) {
        throw new Error("No JSON object found in Gemini output");
      }

      return withoutFences.slice(start, end + 1);
    }
    
    const textOutput = jsonResponse.response.text().trim();

    let json;
    try {
      const clean = cleanJsonString(textOutput);
      json = JSON.parse(clean);
    } catch (e) {
      console.error("❌ Gemini returned invalid JSON:", textOutput);
      return NextResponse.json(
        { error: "Gemini did not return valid JSON", raw: textOutput },
        { status: 500 }
      );
    }

    // STEP 3: Generate Ad Image using Gemini image model
    const imageResponse = await imageModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: json.textToImage || description || "Generate product showcase image" },
            {
              inlineData: {
                mimeType: "image/png",
                data: base64File, // ✅ Pass base64, not URL
              },
            },
          ],
        },
      ],
    });

    // Gemini image outputs base64
    const imageBase64 = imageResponse.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Failed to generate image from Gemini" },
        { status: 500 }
      );
    }

    // STEP 4: Upload generated image to ImageKit
    const uploadResult = await imagekit.upload({
      file: `data:image/png;base64,${imageBase64}`,
      fileName: `ad-${Date.now()}.png`,
      isPublished: true,
    });

    console.log("✅ Generated ad image uploaded:", uploadResult.url);

    //Update Doc
    await updateDoc(doc(db, 'user-ads', docId), {
      finalProductImageUrl: uploadResult?.url,
      productImageUrl: imageKitRef.url,
      status: 'completed',
      userInfo: userInfo?.credits-5,
      imageToVideoPrompt: json?.imageToVideo // Save image to video prompt
    });

    // Return both JSON and Generated Image
    return NextResponse.json({
      prompts: json,
      uploadedImageUrl: imageKitRef.url,
      generatedImage: `data:image/png;base64,${imageBase64}`,
      generatedImageUrl: uploadResult.url, 
    });
  } catch (error: any) {
    console.error("❌ Gemini API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

