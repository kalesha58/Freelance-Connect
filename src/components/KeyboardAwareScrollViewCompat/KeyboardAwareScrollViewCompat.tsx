import React, { ReactNode } from "react";
import { Platform, ScrollView, ScrollViewProps } from "react-native";
import {
    KeyboardAwareScrollView,
    KeyboardAwareScrollViewProps,
} from "react-native-keyboard-controller";

/**
 * Combined properties for the KeyboardAwareScrollViewCompat component.
 */
type TKeyboardAwareScrollViewProps = KeyboardAwareScrollViewProps & ScrollViewProps & {
    children?: ReactNode;
};

/**
 * A compatible ScrollView that handles keyboard visibility and avoids covering inputs.
 * Optimized for React Native CLI with a fallback for web platforms.
 */
export function KeyboardAwareScrollViewCompat({
    children,
    keyboardShouldPersistTaps = "handled",
    ...restProps
}: TKeyboardAwareScrollViewProps) {
    // Web specific fallback as keyboard controller is primarily for native platforms
    if (Platform.OS === "web") {
        return (
            <ScrollView keyboardShouldPersistTaps={keyboardShouldPersistTaps} {...restProps}>
                {children}
            </ScrollView>
        );
    }

    return (
        <KeyboardAwareScrollView
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
            {...restProps}
        >
            {children}
        </KeyboardAwareScrollView>
    );
}
