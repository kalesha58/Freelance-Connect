import React, { useState, useRef } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
    Alert,
    Keyboard,
    TouchableWithoutFeedback
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { uploadImage } from "@/utils/apiClient";

/**
 * CreatePostScreen allows users to share updates, portfolios, or thoughts with the community.
 * Fully modernized with a premium, focused UI.
 */
export default function CreatePostScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { user, addPost } = useApp();

    const [caption, setCaption] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [postType, setPostType] = useState<"social" | "portfolio">("social");
    const [isPosting, setIsPosting] = useState(false);
    const [showTagInput, setShowTagInput] = useState(false);

    const captionInputRef = useRef<TextInput>(null);

    const topPaddingOffset = Platform.OS === "ios" ? insets.top : 20;

    const addTag = () => {
        const cleanTag = tagInput.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        if (cleanTag && !tags.includes(cleanTag)) {
            setTags(prev => [...prev, cleanTag]);
        }
        setTagInput("");
        setShowTagInput(false);
    };

    const removeTag = (tag: string) => {
        setTags(prev => prev.filter(t => t !== tag));
    };

    const pickImage = async (useCamera: boolean) => {
        const options: any = {
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 1200,
            maxHeight: 1200,
        };

        const result = useCamera ? await launchCamera(options) : await launchImageLibrary(options);

        if (result.assets && result.assets.length > 0) {
            setSelectedImage(result.assets[0].uri || null);
        }
    };

    const handlePost = async () => {
        if (!caption.trim()) return;
        setIsPosting(true);

        try {
            let imageUrl = undefined;
            if (selectedImage) {
                const uploadResult = await uploadImage(selectedImage);
                imageUrl = uploadResult.url;
            }

            await addPost({
                caption: caption.trim(),
                tags,
                type: postType,
                imageUrl
            });

            navigation.goBack();
        } catch (error: any) {
            Alert.alert("Post Failed", error.message || "Something went wrong while sharing your post.");
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.root, { backgroundColor: colors.background }]}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            {/* Header */}
            <View style={[styles.header, { paddingTop: topPaddingOffset + 10, borderBottomColor: colors.border }]}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                    <Feather name="x" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground }]}>Create Post</Text>
                <TouchableOpacity
                    style={[styles.postBtn, { backgroundColor: caption.trim() ? colors.primary : colors.card, opacity: caption.trim() ? 1 : 0.6 }]}
                    onPress={handlePost}
                    disabled={!caption.trim() || isPosting}
                >
                    <Text style={[styles.postBtnText, { color: caption.trim() ? "#fff" : colors.mutedForeground }]}>
                        {isPosting ? "Posting..." : "Post"}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* User Context Row */}
                <View style={styles.userRow}>
                    <Image 
                        source={{ uri: user?.avatar || "https://i.pravatar.cc/150?img=68" }} 
                        style={styles.avatar} 
                    />
                    <View style={styles.userInfo}>
                        <Text style={[styles.userName, { color: colors.foreground }]}>{user?.name || "User"}</Text>
                        <TouchableOpacity 
                            style={[styles.typeBadge, { backgroundColor: colors.primary + "15" }]}
                            onPress={() => setPostType(prev => prev === "social" ? "portfolio" : "social")}
                        >
                            <Feather name={postType === "social" ? "message-circle" : "grid"} size={12} color={colors.primary} />
                            <Text style={[styles.typeBadgeText, { color: colors.primary }]}>
                                {postType === "social" ? "Social Update" : "Portfolio Piece"}
                            </Text>
                            <Feather name="chevron-down" size={14} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Main Text Input */}
                <TextInput
                    ref={captionInputRef}
                    style={[styles.captionInput, { color: colors.foreground }]}
                    placeholder="What do you want to talk about?"
                    placeholderTextColor={colors.mutedForeground}
                    value={caption}
                    onChangeText={setCaption}
                    multiline
                    maxLength={1000}
                    autoFocus
                />

                {/* Media Preview */}
                {selectedImage && (
                    <View style={styles.mediaPreviewContainer}>
                        <Image source={{ uri: selectedImage }} style={styles.mediaPreview} />
                        <TouchableOpacity style={styles.removeMediaBtn} onPress={() => setSelectedImage(null)}>
                            <View style={styles.removeMediaBlur}>
                                <Feather name="x" size={18} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Tags Display */}
                {tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                        {tags.map(tag => (
                            <TouchableOpacity
                                key={tag}
                                style={[styles.tagChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                                onPress={() => removeTag(tag)}
                            >
                                <Text style={[styles.tagChipText, { color: colors.foreground }]}>#{tag}</Text>
                                <Feather name="x" size={14} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Inline Tag Input */}
                {showTagInput && (
                    <View style={[styles.tagInputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.tagHash, { color: colors.mutedForeground }]}>#</Text>
                        <TextInput
                            style={[styles.tagInputField, { color: colors.foreground }]}
                            placeholder="Type tag and press enter"
                            placeholderTextColor={colors.mutedForeground}
                            value={tagInput}
                            onChangeText={setTagInput}
                            onSubmitEditing={addTag}
                            returnKeyType="done"
                            autoFocus
                            autoCapitalize="none"
                        />
                    </View>
                )}
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={[styles.bottomActionBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.actionIconBtn} onPress={() => pickImage(false)}>
                        <Feather name="image" size={24} color={colors.mutedForeground} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionIconBtn} onPress={() => pickImage(true)}>
                        <Feather name="camera" size={24} color={colors.mutedForeground} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionIconBtn} onPress={() => setShowTagInput(!showTagInput)}>
                        <Feather name="hash" size={24} color={showTagInput ? colors.primary : colors.mutedForeground} />
                    </TouchableOpacity>
                </View>
                <Text style={[styles.charCount, { color: caption.length > 900 ? colors.destructive : colors.mutedForeground }]}>
                    {caption.length}/1000
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    header: { 
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: "space-between", 
        paddingHorizontal: 16, 
        paddingBottom: 14,
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    iconBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    postBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 24 },
    postBtnText: { fontSize: 15, fontWeight: '700' },
    
    scrollContent: { padding: 20, paddingBottom: 100 },
    
    userRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
    userInfo: { justifyContent: "center" },
    userName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    typeBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4, alignSelf: "flex-start" },
    typeBadgeText: { fontSize: 11, fontWeight: '600' },

    captionInput: { 
        fontSize: 18, 
        fontWeight: '400', 
        minHeight: 120, 
        textAlignVertical: "top", 
        lineHeight: 28,
        marginBottom: 20
    },

    mediaPreviewContainer: { marginBottom: 20, position: 'relative' },
    mediaPreview: { width: "100%", aspectRatio: 1, borderRadius: 16, backgroundColor: '#f0f0f0' },
    removeMediaBtn: { position: "absolute", top: 12, right: 12 },
    removeMediaBlur: { backgroundColor: "rgba(0,0,0,0.6)", padding: 8, borderRadius: 20 },

    tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
    tagChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
    tagChipText: { fontSize: 14, fontWeight: '500' },

    tagInputWrapper: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16, gap: 8 },
    tagHash: { fontSize: 18, fontWeight: '600' },
    tagInputField: { flex: 1, fontSize: 16, fontWeight: '400' },

    bottomActionBar: { 
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: "space-between", 
        paddingHorizontal: 16, 
        paddingVertical: 12, 
        borderTopWidth: StyleSheet.hairlineWidth 
    },
    actionsRow: { flexDirection: "row", gap: 16 },
    actionIconBtn: { padding: 4 },
    charCount: { fontSize: 13, fontWeight: '500' },
});
