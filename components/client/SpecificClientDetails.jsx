
import { useParams } from "next/navigation";

export default function SpecificClientDetails() {

    const { slug } = useParams();

    const clientId = slug[0];
  
    console.log("client id is", clientId);

    return (

        <div>SpecificClientDetails</div>
    )
}

