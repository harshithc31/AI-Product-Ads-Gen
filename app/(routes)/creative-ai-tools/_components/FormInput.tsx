'use client'
import { ImagePlus, Loader2Icon, Monitor, Smartphone, Sparkles, Square } from 'lucide-react'
import React, { useState } from 'react'
import Image from 'next/image'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { Button } from '@/components/ui/button'

const sampleProducts = [
    '/headphone.png',
    '/juice-can.png',
    '/perfume.png',
    '/burger.png',
    '/ice-cream.png'
]

type Props = {
    onHandleInputChange: any,
    OnGenerate: any,
    loading: boolean
}

function FormInput({ onHandleInputChange, OnGenerate, loading } : Props) {

    const [preview, setPreview] = useState<string | null>()
    const onFileSelect = (files: FileList | null) => {
        if(!files || files?.length == 0) return;
        const file = files[0];
        if(file.size > 5*1024*1024) {
            alert("File size greater than 5 MB");
            return;
        }

        onHandleInputChange('file', file);
        setPreview(URL.createObjectURL(file));
    }

  return (
    <div>
        <div>
            <h2 className='font-semibold'>1. Upload Product Image</h2>
            <div>
                <label htmlFor='imageUpload' className='mt-2 border-dashed border-2 rounded-xl flex flex-col p-4 items-center justify-center min-h-[200px] cursor-pointer'>
                    {!preview? 
                        <div className='flex flex-col items-center gap-3'>
                            <ImagePlus className='h-8 w-8' />
                            <h2 className='text-xl'>Click here to upload image</h2>
                            <p className='opacity-45'>Upload image upto 5 MB</p>
                        </div>
                    :   <Image src={preview} alt='preview' width={300} height={300} className='w-full h-full max-h-[200px] object-contain rounded-lg' />
                    }
                </label>

                <input type="file" id='imageUpload' className='hidden' accept='image/*' 
                    onChange={(event) => onFileSelect(event.target.files)}
                />
            </div>
            {/* Sample Products  */}
            <div>
                <h2 className='opacity-50 text-center mt-3'>Select sample products to try!</h2>
                <div className='flex gap-3 items-center mt-3'>
                    {sampleProducts.map((product, index) => (
                        <Image src={product} alt={product} width={100} height={100} key={index} 
                            className='w-[60px] h-[60px] rounded-lg cursor-pointer hover:scale-105 transition-all'
                            onClick={()=>{
                                setPreview(product);
                                onHandleInputChange('imageUrl', product);
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
        
        <div className='mt-8'>
            <h2 className='font-semibold'>2. Enter Product Description</h2>
            <Textarea placeholder='Tell me more about product and how you want to display?' 
                className='min-h-[150px] mt-2'
                onChange={(event)=>onHandleInputChange('description', event.target.value)}
            />
        </div>
        <div className='mt-8'>
            <h2 className='font-semibold'>3. Select Image Size</h2>
            <Select onValueChange={(value)=>onHandleInputChange('size', value)}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Resolution" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="1024x1024">
                        <div className='flex gap-2 items-center'>
                            <Square className='h-4 w-4'/>
                            <span>1:1</span>
                        </div>
                    </SelectItem>
                    <SelectItem value="1536x1024">
                        <div className='flex gap-2 items-center'>
                            <Monitor className='h-4 w-4'/>
                            <span>16:9</span>
                        </div>
                    </SelectItem>
                    <SelectItem value="1024x1536">
                        <div className='flex gap-2 items-center'>
                            <Smartphone className='h-4 w-4'/>
                            <span>9:16</span>
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>

        <Button disabled={loading} className='mt-5 w-full' onClick={OnGenerate}> 
            {loading? <Loader2Icon className='animate-spin' /> : <Sparkles />} Generate </Button>
        <h2 className='mt-1 text-sm opacity-35 text-center'>5 Credits to Generate</h2>
    </div>
  )
}

export default FormInput