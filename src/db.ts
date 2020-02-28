import { DynamoDB } from 'aws-sdk';
import { AttributeMap } from 'aws-sdk/clients/dynamodb';
import { formatISO } from 'date-fns';
import { Location } from './locations';

const tableName = 'WtrLunchMenus';
let internalDbClient: DynamoDB;
function getDynamoDbClient(): DynamoDB {
  if (!internalDbClient) {
    internalDbClient = new DynamoDB({
      region: 'eu-west-1'
    });
  }

  return internalDbClient;
}

function createLocationId(location: string, date: Date): string {
  return `${location}-${formatISO(date, { representation: 'date' })}`;
}

export async function getMenusFromDb<T>(location: Location, date: Date): Promise<T|undefined> {
  const database = getDynamoDbClient();

  const result = await database.getItem({
    TableName: tableName,
    Key: {
      LocationDateId: {
        S: createLocationId(location, date)
      }
    }
  }).promise();

  if (result.Item?.Menus.S) {
    return JSON.parse(result.Item.Menus.S) as T;
  }

  return undefined;
}

export async function addMenusToDb(location: Location, date: Date, menu: object): Promise<void> {
  const database = getDynamoDbClient();
  await database.putItem({
    TableName: tableName,
    Item: {
      LocationDateId: {
        S: createLocationId(location, date)
      },
      Menus: {
        S: JSON.stringify(menu)
      }
    }
  }).promise();
}
