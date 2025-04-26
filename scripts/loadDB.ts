import {DataAPIClient} from "@datastax/astra-db-ts"
import {PuppeteerWebBaseLoader} from "langchain/document_loaders/web/puppeteer"
import OpenAI from "openai"

import {RecursiveCharacterTextSplitter} from "langchain/text_splitter"

import "dotenv/config"

type SimilarityMetric = "dot_product" | "cosine" | "euclidean"

const {ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY } = process.env
const openai = new OpenAI({apiKey: OPENAI_API_KEY})
const f1Data = [
    'https://en.wikipedia.org/wiki/Formula_One',
    'https://www.formula1.com/',
    'https://www.viagogo.com/in/Sports-Tickets/Sports-and-Outdoors/Formula-1-Tickets?=&PCID=PSINBINHOME452673525B4E87&ps=&ps_p=1&ps_c=663081588&ps_ag=1340307146782153&ps_tg=kwd-83770316197739:loc-90&ps_ad=83769471091829&ps_n=o&ps_d=c&gclid=f333828534a813055fc7ea882f7b9cb6&msclkid=f333828534a813055fc7ea882f7b9cb6'

] 
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT,{namespace : ASTRA_DB_NAMESPACE})
const splitter = new RecursiveCharacterTextSplitter({

    chunkSize:512,
    chunkOverlap:100


})

const createCollection = async(similarityMetric:SimilarityMetric = "dot_product")=>{
    const res = await db.createCollection(ASTRA_DB_COLLECTION,{
        vector:{
            dimension:1536,
            metric: similarityMetric
        }
    })
    console.log(res)
}
const loadSampleData = async()=>{
    const collection = await db.collection(ASTRA_DB_COLLECTION)
    for await (const url of f1Data){
        const content = await scrapePage(url)
        const chunks = await splitter.splitText(content)
        for await(const chunk of chunks){
            const embedding = await openai.embeddings.create({
                model:"text-embedding-3-small",
                input: chunk,
                encoding_format: "float"
            })
            const vector = embedding.data[0].embedding
            const res = await collection.insertOne({
                $vector: vector,
                text: chunk
            })
            console.log(res)
        }

    }
}

const scrapePage = async (url: string)=>{
    const loader = new PuppeteerWebBaseLoader(url,{
        launchOptions:{
            headless:true

        },
        gotoOptions:{
            waitUntil: "domcontentloaded"
        },
        evaluate: async (pageXOffset, browser)=>{
            const result = await pageXOffset.evaluate(()=> document.body.innerHTML)
            await browser.close
            return result
        }
    })
    return (await loader.scrape())?.replace(/<[^>]*>?/gm,'')
}

createCollection().then(()=>loadSampleData())
