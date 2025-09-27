import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, QueryCommand, BatchWriteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
export const ddb = DynamoDBDocumentClient.from(client, { marshallOptions: { removeUndefinedValues: true } });
const TABLE_NAME = process.env.TABLE_NAME;

export const db = {
  get: (Key) => ddb.send(new GetCommand({ TableName: TABLE_NAME, Key })),
  put: (Item) => ddb.send(new PutCommand({ TableName: TABLE_NAME, Item })),
  del: (Key) => ddb.send(new DeleteCommand({ TableName: TABLE_NAME, Key })),
  update: (params) => ddb.send(new UpdateCommand({ TableName: TABLE_NAME, ...params })),
  query: (params) => ddb.send(new QueryCommand({ TableName: TABLE_NAME, ...params })),
  batchWrite: (Requests) => ddb.send(new BatchWriteCommand({ RequestItems: { [TABLE_NAME]: Requests } }))
};