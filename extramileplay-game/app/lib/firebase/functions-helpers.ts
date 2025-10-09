import { functions } from './config';
import { httpsCallable } from 'firebase/functions';

/**
 * Helper function to call Cloud Functions
 * @param functionName - The name of the cloud function to call
 * @param data - Data to pass to the function
 */
export async function callCloudFunction<T = any, R = any>(
  functionName: string,
  data?: T
): Promise<R> {
  try {
    const cloudFunction = httpsCallable<T, R>(functions, functionName);
    const result = await cloudFunction(data);
    return result.data;
  } catch (error) {
    console.error(`Error calling cloud function ${functionName}:`, error);
    throw error;
  }
}

/**
 * Example: Call the addMessage function
 */
export async function addMessage(text: string) {
  return callCloudFunction('addMessage', { text });
}

/**
 * Example: Call the helloWorld function
 */
export async function getHelloWorld() {
  return callCloudFunction('helloWorld');
}

