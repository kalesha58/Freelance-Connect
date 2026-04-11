import React from 'react';
import { 
    StyleSheet, 
    Text, 
    TouchableOpacity, 
    View, 
    Modal, 
    Dimensions, 
    Platform 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useColors } from '@/hooks/useColors';

const { width } = Dimensions.get('window');

interface Action {
    label: string;
    icon?: string;
    onPress: () => void;
    destructive?: boolean;
}

interface CustomActionSheetProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    actions: Action[];
}

const CustomActionSheet: React.FC<CustomActionSheetProps> = ({
    visible,
    onClose,
    title,
    description,
    actions
}) => {
    const colors = useColors();
    const insets = useSafeAreaInsets();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                style={styles.overlay} 
                activeOpacity={1} 
                onPress={onClose}
            >
                <View 
                    style={[
                        styles.sheet, 
                        { 
                            backgroundColor: colors.background,
                            paddingBottom: (insets.bottom || 20) + 12
                        }
                    ]}
                >
                    <View style={[styles.handle, { backgroundColor: colors.border }]} />
                    
                    {(title || description) && (
                        <View style={styles.header}>
                            {title && <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>}
                            {description && <Text style={[styles.description, { color: colors.mutedForeground }]}>{description}</Text>}
                        </View>
                    )}

                    <View style={styles.actionsList}>
                        {actions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.actionItem,
                                    { borderTopWidth: index === 0 ? 0 : 1, borderTopColor: colors.border + "30" }
                                ]}
                                onPress={() => {
                                    onPress: action.onPress();
                                    onClose();
                                }}
                            >
                                <View style={styles.actionLeft}>
                                    {action.icon && (
                                        <Feather 
                                            name={action.icon as any} 
                                            size={20} 
                                            color={action.destructive ? colors.destructive : colors.foreground} 
                                        />
                                    )}
                                    <Text 
                                        style={[
                                            styles.actionLabel, 
                                            { color: action.destructive ? colors.destructive : colors.foreground }
                                        ]}
                                    >
                                        {action.label}
                                    </Text>
                                </View>
                                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity 
                        style={[styles.cancelBtn, { backgroundColor: colors.muted + "20" }]} 
                        onPress={onClose}
                    >
                        <Text style={[styles.cancelText, { color: colors.foreground }]}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    sheet: {
        width: '100%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    header: {
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        textAlign: 'center',
    },
    actionsList: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 12,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 4,
    },
    actionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    cancelBtn: {
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '700',
    },
});

export default CustomActionSheet;
