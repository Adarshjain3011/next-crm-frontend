
'use client'


import { useParams } from "next/navigation";

export default function SpecificOrderDetail (){

    const {slug} = useParams();

    return (

        <div>

            specific order detail 

        </div>
    )
}

