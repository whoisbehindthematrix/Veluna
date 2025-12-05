import Reactotron from 'reactotron-react-native';
import { NativeModules } from 'react-native';

// 1. We know your specific IP from ifconfig, so let's just use it.
// This avoids the crash and ensures the phone finds your laptop.
const scriptHostname = '10.89.34.1'; 

// OR: If you want a safe dynamic fallback (optional, you can skip this logic):
// const scriptURL = NativeModules.SourceCode?.scriptURL;
// const scriptHostname = scriptURL ? scriptURL.split('://')[1].split(':')[0] : '10.89.34.1';

const reactotron = Reactotron
  .configure({ 
    host: scriptHostname,
    name: 'Veluna' // Optional: names your connection in the desktop app
  }) 
  .useReactNative({
    asyncStorage: false, // if there's AsyncStorage, set to true
    networking: {
      // optionally, you can turn it off as false
      ignoreUrls: /symbolicate/,
    },
    editor: false, // set to true for debugging
    errors: { veto: (stackFrame) => false }, // or turn it off with false
    overlay: false, // just turning off overlay
  }) 
  .connect(); 

// Don't override console.log - we'll use Reactotron explicitly where needed
// This allows both console.log and Reactotron.log to work

// Export for use in other files
export default reactotron;