import { DynamoDB } from 'aws-sdk';
import { formatISO } from 'date-fns';
import { Location } from './locations';
import { LocationMenu } from './sharedModels';

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

export async function getMenusFromDb(location: Location, date: Date): Promise<LocationMenu[]|undefined> {
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
    return JSON.parse(result.Item.Menus.S);
  }

  return undefined;
}

export async function addMenusToDb(location: Location, date: Date, menu: LocationMenu[]): Promise<void> {
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
