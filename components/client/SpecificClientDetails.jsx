import { useParams } from "next/navigation";

export default function SpecificClientDetails() {

    const { slug } = useParams();

    const clientId = slug[0];

    return (

        <div>SpecificClientDetails</div>
    )
}

