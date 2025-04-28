import React from "react";
import "./global.css"

export const metadata = {
    title:"F1GPT",
    description: "The place for all your FOrmula One questions!"
}

const RootLayout = ({children})=>{
    return (
        <html>
            <body>
                {children}
            </body>
        </html>
    )
}

export default RootLayout