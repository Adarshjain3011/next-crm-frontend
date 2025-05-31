
'use client'


import { useParams } from "next/navigation";

export default function SpecificOrderDetail (){

    const {slug} = useParams();

    console.log("slug value is : ", slug);

    return (

        <div>

            specific order detail 

        </div>
    )
}

