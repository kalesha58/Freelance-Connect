declare module 'react-native-vector-icons/Feather' {
    import { Component } from 'react';
    import { IconProps } from 'react-native-vector-icons/Icon';
    class Feather extends Component<IconProps> { }
    export default Feather;
}

declare module 'react-native-vector-icons/Ionicons' {
    import { Component } from 'react';
    import { IconProps } from 'react-native-vector-icons/Icon';
    class Ionicons extends Component<IconProps> { }
    export default Ionicons;
}

declare module 'react-native-vector-icons/MaterialCommunityIcons' {
    import { Component } from 'react';
    import { IconProps } from 'react-native-vector-icons/Icon';
    class MaterialCommunityIcons extends Component<IconProps> { }
    export default MaterialCommunityIcons;
}

declare module 'react-native-restart' {
    interface IRNRestart {
        Restart(): void;
    }
    const RNRestart: IRNRestart;
    export default RNRestart;
}
