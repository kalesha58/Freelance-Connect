import React, { useState } from "react";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { uploadImage } from "@/utils/apiClient";

/**
 * CreatePostScreen allows users to share updates, portfolios, or thoughts with the community.
 * Specialized for the Community Feed with media upload and tagging features.
 */
export default function CreatePostScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { user } = useApp();

    const [caption, setCaption] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [postType, setPostType] = useState<"social" | "portfolio">("social");
    const [isPosting, setIsPosting] = useState(false);

    const topPaddingOffset = Platform.OS === "ios" ? insets.top : 20;
    const { addPost } = useApp();

    const addTag = () => {
        const cleanTag = tagInput.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        if (cleanTag && !tags.includes(cleanTag)) {
            setTags(prev => [...prev, cleanTag]);
        }
        setTagInput("");
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
            style={[styles.postRoot, { backgroundColor: colors.background }]}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={[styles.postHeaderBar, { paddingTop: topPaddingOffset + 6, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="x" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.postHeaderTitle, { color: colors.foreground }]}>Create Post</Text>
                <TouchableOpacity
                    style={[styles.publishActionBtn, { backgroundColor: caption.trim() ? colors.primary : colors.muted }]}
                    onPress={handlePost}
                    disabled={!caption.trim() || isPosting}
                >
                    <Text style={[styles.publishActionLabel, { color: caption.trim() ? "#fff" : colors.mutedForeground }]}>
                        {isPosting ? "Posting..." : "Post"}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.postContentArea} showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                    style={[styles.mediaDropZone, { backgroundColor: colors.card, borderColor: selectedImage ? colors.primary : colors.border }]}
                    onPress={() => pickImage(false)}
                    activeOpacity={0.8}
                >
                    {selectedImage ? (
                        <View style={styles.mediaActivePreview}>
                            <Image source={{ uri: selectedImage }} style={styles.selectedImagePreview} />
                            <TouchableOpacity style={styles.removeImageBtn} onPress={() => setSelectedImage(null)}>
                                <Feather name="trash-2" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <View style={[styles.uploadIconSurface, { backgroundColor: colors.muted }]}>
                                <Feather name="upload" size={28} color={colors.mutedForeground} />
                            </View>
                            <Text style={[styles.uploadPromptLabel, { color: colors.foreground }]}>Upload Image or Video</Text>
                            <Text style={[styles.uploadRequirementsLabel, { color: colors.mutedForeground }]}>JPG, PNG, up to 10MB</Text>
                            <View style={styles.uploadSourceButtonsRow}>
                                <TouchableOpacity 
                                    style={[styles.uploadSourceBtn, { borderColor: colors.primary }]}
                                    onPress={() => pickImage(true)}
                                >
                                    <Feather name="camera" size={14} color={colors.primary} />
                                    <Text style={[styles.uploadSourceBtnLabel, { color: colors.primary }]}>Camera</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.uploadSourceBtn, { borderColor: colors.primary }]}
                                    onPress={() => pickImage(false)}
                                >
                                    <Feather name="image" size={14} color={colors.primary} />
                                    <Text style={[styles.uploadSourceBtnLabel, { color: colors.primary }]}>Gallery</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </TouchableOpacity>

                <View style={styles.typeSelectorRow}>
                    <TouchableOpacity
                        style={[styles.typeBtn, postType === "social" && { backgroundColor: colors.primary + "20", borderColor: colors.primary }]}
                        onPress={() => setPostType("social")}
                    >
                        <Feather name="message-square" size={16} color={postType === "social" ? colors.primary : colors.mutedForeground} />
                        <Text style={[styles.typeBtnLabel, { color: postType === "social" ? colors.primary : colors.mutedForeground }]}>Social Post</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typeBtn, postType === "portfolio" && { backgroundColor: colors.primary + "20", borderColor: colors.primary }]}
                        onPress={() => setPostType("portfolio")}
                    >
                        <Feather name="grid" size={16} color={postType === "portfolio" ? colors.primary : colors.mutedForeground} />
                        <Text style={[styles.typeBtnLabel, { color: postType === "portfolio" ? colors.primary : colors.mutedForeground }]}>Portfolio piece</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.captionInputSection}>
                    <Text style={[styles.fieldLabelLabel, { color: colors.foreground }]}>Caption</Text>
                    <TextInput
                        style={[styles.captionTextArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                        placeholder="Share your work, thoughts, or achievements..."
                        placeholderTextColor={colors.mutedForeground}
                        value={caption}
                        onChangeText={setCaption}
                        multiline
                        maxLength={500}
                    />
                    <Text style={[styles.charCountBadge, { color: colors.mutedForeground }]}>{caption.length}/500</Text>
                </View>

                <View style={styles.tagInputSection}>
                    <Text style={[styles.fieldLabelLabel, { color: colors.foreground }]}>Tags</Text>
                    <View style={[styles.tagInputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.hashSymbol, { color: colors.mutedForeground }]}>#</Text>
                        <TextInput
                            style={[styles.tagInputField, { color: colors.foreground }]}
                            placeholder="Add tags (press enter)"
                            placeholderTextColor={colors.mutedForeground}
                            value={tagInput}
                            onChangeText={setTagInput}
                            onSubmitEditing={addTag}
                            returnKeyType="done"
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={addTag} style={[styles.addTagCircularBtn, { backgroundColor: colors.primary }]}>
                            <Feather name="plus" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    {tags.length > 0 && (
                        <View style={styles.activeTagsWrap}>
                            {tags.map(tag => (
                                <TouchableOpacity
                                    key={tag}
                                    style={[styles.tagChipSurface, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "30" }]}
                                    onPress={() => removeTag(tag)}
                                >
                                    <Text style={[styles.tagChipLabel, { color: colors.primary }]}>#{tag}</Text>
                                    <Feather name="x" size={12} color={colors.primary} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                <View style={[styles.postingTipCard, { backgroundColor: colors.blueLight, borderColor: colors.primary + "30" }]}>
                    <Feather name="info" size={16} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.tipTitleLabel, { color: colors.primary }]}>Tips for great posts</Text>
                        <Text style={[styles.tipDescriptionText, { color: colors.mutedForeground }]}>Show behind-the-scenes work, celebrate milestones, and share insights to attract more clients.</Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    postRoot: { flex: 1 },
    postHeaderBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
    postHeaderTitle: { fontSize: 16, fontWeight: '700' },
    publishActionBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
    publishActionLabel: { fontSize: 14, fontWeight: '700' },
    postContentArea: { padding: 16, gap: 20, paddingBottom: 60 },
    mediaDropZone: { borderRadius: 16, borderWidth: 2, borderStyle: "dashed", padding: 24, alignItems: "center", gap: 10, minHeight: 180, justifyContent: "center" },
    mediaActivePreview: { width: "100%", aspectRatio: 1.5, borderRadius: 12, alignItems: "center", justifyContent: "center", gap: 8 },
    mediaStatusText: { fontSize: 15, fontWeight: '600' },
    mediaResetHint: { fontSize: 12, fontWeight: '400' },
    uploadIconSurface: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 4 },
    uploadPromptLabel: { fontSize: 15, fontWeight: '600' },
    uploadRequirementsLabel: { fontSize: 12, fontWeight: '400' },
    uploadSourceButtonsRow: { flexDirection: "row", gap: 12, marginTop: 4 },
    uploadSourceBtn: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
    uploadSourceBtnLabel: { fontSize: 13, fontWeight: '600' },
    selectedImagePreview: { width: "100%", height: "100%", borderRadius: 12 },
    removeImageBtn: { position: "absolute", top: 10, right: 10, backgroundColor: "rgba(0,0,0,0.6)", padding: 8, borderRadius: 20 },
    captionInputSection: { gap: 8 },
    fieldLabelLabel: { fontSize: 14, fontWeight: '600' },
    captionTextArea: { borderRadius: 14, borderWidth: 1.5, padding: 14, fontSize: 15, fontWeight: '400', minHeight: 100, textAlignVertical: "top", lineHeight: 22 },
    charCountBadge: { fontSize: 11, fontWeight: '400', alignSelf: "flex-end" },
    tagInputSection: { gap: 8 },
    tagInputWrapper: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
    hashSymbol: { fontSize: 16, fontWeight: '600' },
    tagInputField: { flex: 1, fontSize: 15, fontWeight: '400' },
    addTagCircularBtn: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    activeTagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    tagChipSurface: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
    tagChipLabel: { fontSize: 13, fontWeight: '500' },
    postingTipCard: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "flex-start" },
    tipTitleLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
    tipDescriptionText: { fontSize: 12, fontWeight: '400', lineHeight: 18 },
    typeSelectorRow: { flexDirection: "row", gap: 12 },
    typeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: "transparent" },
    typeBtnLabel: { fontSize: 14, fontWeight: "600" },
});
