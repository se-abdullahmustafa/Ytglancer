import React from 'react'
import Instructions from '../components/instructions/instructions'

export default function About() {
    return (
        <div className="mt-48 flex flex-col items-center justify-center h-100 bg-white">
            <div className='w-[90%] max-w-[920px] lg:w-[70%]'>
                <h1 className="text-3xl font-bold">Discover VideoGlancer – Revolutionizing Video Learning</h1>
                <p className='mt-4'>Welcome to VideoGlancer, where learning meets innovation. Our mission is to transform the way you learn from online videos by offering a revolutionary solution that converts YouTube content into tailored PDF notes. At VideoGlancer, we are dedicated to making your learning journey more efficient, effective, and enjoyable.</p>
            </div>
            <div className='w-[90%] max-w-[920px] lg:w-[70%] mt-8'>
                <h2 className="text-2xl font-bold">Our Vision:</h2>
                <p className='mt-4'>Our vision is to empower learners around the world with a tool that simplifies the process of converting valuable video content into insightful PDF notes. We believe that information should be easily accessible, customizable, and memorable, and that’s precisely what VideoGlancer aims to deliver.</p>
            </div>
            <div className='w-[90%] max-w-[920px] lg:w-[70%] mt-8'>
                <Instructions heading={"Why VideoGlancer?"} points={[
                    { step: "Empowerment Through Conversion: ", desc: "VideoGlancer allows you to effortlessly convert YouTube videos into organized PDF notes, ensuring you capture the essence of the content." },
                    { step: "Customization at Your Fingertips: ", desc: "Tailor your PDF notes to your preferences. Highlight key points, add personal annotations, and structure your notes as you see fit." },
                    { step: "Learn Anywhere, Anytime: ", desc: "With downloadable PDF notes, your learning isn’t confined to an internet connection. Access your insights on the go, even offline." },
                    { step: "Innovation in Learning: ", desc: "VideoGlancer merges technology and education, paving the way for a more immersive and effective learning experience." }
                ]} />
            </div>
            <div className='w-[90%] max-w-[920px] lg:w-[70%] mt-8'>
                <h2 className="text-2xl font-bold">Our Commitment to Excellence:</h2>
                <p className='mt-4'>At VideoGlancer, we’re committed to delivering a seamless and user-friendly platform that enhances your interaction with online educational content. We’re continually exploring new ways to improve our services and provide you with a tool that resonates with your learning needs.</p>
            </div>
            <div className='w-[90%] max-w-[920px] lg:w-[70%] mt-8'>
                <h2 className="text-2xl font-bold">Join the VideoGlancer Community:</h2>
                <p className='mt-4'>We invite you to be a part of the VideoGlancer community. Discover a world where learning transcends traditional boundaries, and knowledge is accessible at your fingertips. Together, we’re redefining the learning landscape, one PDF note at a time.</p>
                <p className='mt-4'>Thank you for choosing VideoGlancer for your learning journey. We look forward to being your companion on the road to knowledge and growth.</p>
                <p className='mt-4'>Remember, VideoGlancer is not just a tool; it’s a transformative experience that empowers you to unlock the potential of online videos. Dive in and explore the world of VideoGlancer today!</p>
            </div>
        </div>

    )
}
