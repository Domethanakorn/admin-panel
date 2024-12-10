import Link from "next/link";


export default function Page(){
    return (
        <main>
            <h1>Dashboard</h1>
            <Link href={"/admin"}>AdminPanel</Link>
        </main>
    );
}