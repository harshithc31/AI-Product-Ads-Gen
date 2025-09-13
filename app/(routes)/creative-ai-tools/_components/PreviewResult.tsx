// "use client"
// import { useAuthContext } from '@/app/provider'
// import { db } from '@/configs/firebaseConfig';
// import { collection, onSnapshot, query, where } from 'firebase/firestore';
// import React, { useState } from 'react'

// type PreviewProduct = {
//   id: string,
//   finalProductImageUrl: string,
//   productImageUrlistring: string,
//   description: string,
//   size: string,
//   status: string,
// };

// function PreviewResult() {
//   const { user } = useAuthContext();
//   const [productList, setProductList] = useState<PreviewProduct[]>();
//   const q = query(collection(db, "user-ads"), 
//     where('userEmail', '==', user?.email)
//   )
  
//   const unSub = onSnapshot(q, (querySnapshot) => {
//     const matchedDocs: any = [];
//     querySnapshot.forEach((doc) => {
//       matchedDocs.push({id: doc.id, ...doc.data()});
//     })
//     console.log(matchedDocs);
//     setProductList(matchedDocs);
//   })

//   return (
//     <div>PreviewResult</div>
//   )
// }

// export default PreviewResult

"use client"
import { useAuthContext } from '@/app/provider'
import { Button } from '@/components/ui/button';
import { db } from '@/configs/firebaseConfig';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { Download, Loader2Icon, LoaderCircle, Play, Sparkle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

type PreviewProduct = {
  id: string,
  finalProductImageUrl: string,
  productImageUrl: string,
  description: string,
  size: string,
  status: string,
  imageToVideoStatus: string,
  videoUrl: string,
};

function PreviewResult() {
  const { user } = useAuthContext();
  const [productList, setProductList] = useState<PreviewProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.email) return; // ✅ guard: don't run query until email is available

    const q = query(
      collection(db, "user-ads"),
      where("userEmail", "==", user.email)
    );

    const unSub = onSnapshot(q, (querySnapshot) => {
      const matchedDocs: PreviewProduct[] = [];
      querySnapshot.forEach((doc) => {
        matchedDocs.push({ id: doc.id, ...doc.data() } as PreviewProduct);
      });
      console.log(matchedDocs);
      setProductList(matchedDocs);
    });

    // cleanup
    return () => unSub();
  }, [user?.email]);

  const DownloadImage = async(imageUrl: string) => {
    const result = await fetch(imageUrl);
    const blob = await result.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;

    a.setAttribute('download', 'harshitprojects');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);

    //atach toast that image downloaded
  }

  const GenerateVideo = async(config: any) => {
    setLoading(true);
    const result = await axios.post('/api/generate-product-video', {
      imageUrl: config?.finalProductImageUrl,
      imageToVideoPrompt: config?.imageToVideoPrompt,
      uid: user?.uid,
      docId: config?.id
    });
    setLoading(false);

    console.log(result.data);
  }

  return (
    <div className='p-5 rounded-2xl border'>
      <h2 className='font-bold text-2xl'>Generated Result</h2>
      <div className='mt-4 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-5'>
        {productList?.map((product, index) => (
          <div key={index}>
            {product?.status == 'completed'?
              <div>
                <Image src={product.finalProductImageUrl} alt={product.id} 
                  width={500} height={500} 
                  className='w-full h-[250px] object-cover rounded-lg' 
                />

                <div className='flex justify-between items-center mt-2'>
                  <div className='flex items-center gap-2'>
                    <Button variant={'ghost'} onClick={()=>DownloadImage(product.finalProductImageUrl)}> <Download /> </Button>
                    <Link href={product.finalProductImageUrl} target='_blank'>
                      <Button variant={'ghost'}> View </Button>
                    </Link>
                    {product?.videoUrl && 
                      <Link href={product?.videoUrl} target='_blank'>
                        <Button variant={'ghost'}> <Play/> </Button>
                      </Link>
                    }
                  </div>
                  {!product?.videoUrl && 
                    <Button 
                      disabled={product?.imageToVideoStatus=='pending'} 
                      onClick={()=>GenerateVideo(product)}> 
                      {product?.imageToVideoStatus=='pending' ? <LoaderCircle className='animate-spin' /> 
                      : <Sparkle /> } Animate 
                    </Button>
                  }
                </div>
              </div>
            : <div className='flex flex-col items-center justify-center border rounded-xl h-full min-h-[250px] bg-zinc-700'>
                <Loader2Icon className='animate-spin' />
                <h2>Generating...</h2>
              </div>
            }
          </div>
        ))}
      </div>
      
    </div>
  );
}

export default PreviewResult;
