import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const AiTools=[
    {
        name:'AI Products Images',
        desc:'Generate high quality, professional product images.',
        bannerImage:'/product-image.png',
        path:'/creative-ai-tools/product-images'
    },
    {
        name:'AI Products Video',
        desc:'Create engaging product showcase videos using AI.',
        bannerImage:'/product-video.png',
        path:'/creative-ai-tools/product-video'
    },
    {
        name:'AI Products with Avatar',
        desc:'Bring your products to life with the help of AI Avatars.',
        bannerImage:'/product-avatar.png',
        path:'/'
    }
]

function AiToolList() {
    return (
        <div>
            <h2 className="font-bold text-2xl mb-4">Creative AI Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {AiTools.map((tool, index) => (
                    <div key={index} className="flex items-center justify-between p-7 bg-zinc-800 rounded-2xl">
                        <div>
                            <h2 className="font-bold text-2xl">{tool.name}</h2>
                            <p className="opacity-60 mt-2">{tool.desc}</p>
                            <Link href={tool.path}>
                                <Button className="mt-3">Create Now</Button>
                            </Link>
                        </div>
                        <Image src={tool.bannerImage} alt={tool.name} 
                            width={200}
                            height={200}
                            className="w-[150px]"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AiToolList