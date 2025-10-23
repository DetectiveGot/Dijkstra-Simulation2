import Link from "next/link";

export default function Navbar() {
    return (
        <nav className='sticky top-0 w-full h-16 flex justify-between px-6 shadow items-center'>
            <Link href='/'><h1>Home</h1></Link>
        </nav>
    )
}