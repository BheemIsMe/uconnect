
import * as events from 'aws-lambda'
import * as dynamodb from '@aws-sdk/client-dynamodb'

import process from 'process'
/**
 * checks the existence of email in the database, before signup and approves the signup
 * expects environment: {TABLE_NAME, TABLE_REGION,POOL_REGION,POOL_ID}
 * user shouldn't be in database and shouldn't be in pool
 * @param event PreSignUpTriggerEvent
 * @returns Promise<events.PreSignUpTriggerEvent | null>
 */

export async function handler(event: events.PreSignUpTriggerEvent): Promise<events.PreSignUpTriggerEvent | null>{

    try{
        console.log(event)

        const email: string = event.request.userAttributes['email']
        const db_client = new dynamodb.DynamoDBClient({
            region: process.env.TABLE_REGION
        })
        const school =await db_client.send(new dynamodb.GetItemCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                'PK': {
                    S: email
                },
                'SK': {
                    S: email
                }
            }
        }))

        if(school.Item){
            throw new Error("school has already existed")
        }

        return event
    }catch(err){
        console.log(err)
        
        return null
    }
    
}