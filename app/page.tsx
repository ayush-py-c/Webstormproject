"use client"
import React from "react"
import Image from "next/image"
import imgf1 from './assets/imgf1.png'
import {useChat} from "ai/react"
import { Message } from "openai/resources/beta/threads/messages"
import Bubble from "./components/Bubble"
import LoadingBubble from "./components/LoadingBubble"
import PromptSuggestionsRow from "./components/PromptSuggestionsRow"


const Home =()=>{
    const  {append,isLoading,messages,input, handleInputChange, handleSubmit} = useChat()
    const noMessage = !messages || messages.length === 0
    const handlePrompt = (promptText)=>{
        const msg: Message = {
            id: crypto.randomUUID(),
            content:promptText,
            role:"user"
        }
        append(msg)
    }

    return(
        <main>
            <Image src={imgf1} width="250" alt="F1GPT Logo"/>
            <section className={noMessage?"": "populated"}>
                {noMessage?(
                    <>
                        <p className="starter-text">
                            The ultimate place for formula one super fans!
                            We hope you enjoy!
                        </p>
                        <br />
                        <PromptSuggestionsRow onPromptClick={handlePrompt}/>
                    </>
                ):(
                    <>
                        {messages.map((message,index)=> <Bubble key = {`message-${index}`} message = {message}/>)}
                        {isLoading && <LoadingBubble/>}
                    </>
                )}
            </section>
                <form onSubmit={handleSubmit}>
                    <input className="question-box" onChange={handleInputChange} value={input} placeholder="Ask me Something"/>
                    <input type = "submit"/>
                </form>
        </main>
    )
}
export default Home