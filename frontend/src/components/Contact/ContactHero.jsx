import { MessageSquare } from 'lucide-react';

export default function ContactHero() {
    return (
        <div className="relative bg-yellow-500 py-20">
            <div className="max-w-7xL mx-auto px-4">
                <div className="flex flex-col items-center text-center">
                    <MessageSquare className="w-16 h-16 text-white mb-6" />
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Contact Us
                    </h1>
                    <p className="text-4"></p>
                </div>
            </div>
        </div>
    )
}
