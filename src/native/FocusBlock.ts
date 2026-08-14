import { NativeModules } from 'react-native';

type FocusBlockModule = {
  ping(): Promise<string>;
};

const { FocusBlock } = NativeModules as { FocusBlock: FocusBlockModule };

export default FocusBlock;
