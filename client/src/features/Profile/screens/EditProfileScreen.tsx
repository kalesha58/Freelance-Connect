import React, { useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Platform,
    KeyboardAvoidingView,
    Modal,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function EditProfileScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { user, updateProfile } = useApp();

    const [isSaving, setIsSaving] = useState(false);
    
    // Core Profile State
    const [bio, setBio] = useState(user?.bio || "");
    const [tagline, setTagline] = useState(user?.tagline || "");
    const [location, setLocation] = useState(user?.location || "");
    const [education, setEducation] = useState(user?.education || []);
    const [experience, setExperience] = useState(user?.experience || []);
    const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl || "");

    // Item Edit Modal State
    const [isEduModalVisible, setIsEduModalVisible] = useState(false);
    const [isExpModalVisible, setIsExpModalVisible] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Temp Form State (Education)
    const [eduForm, setEduForm] = useState({ institution: "", degree: "", startYear: "", endYear: "" });
    // Temp Form State (Experience)
    const [expForm, setExpForm] = useState({ company: "", role: "", startYear: "", endYear: "", description: "" });

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await updateProfile({
                bio,
                tagline,
                location,
                education,
                experience,
                ...(user?.role === "freelancer" ? { portfolioUrl: portfolioUrl.trim() } : {}),
            });
            Alert.alert("Success", "Profile updated successfully!");
            navigation.goBack();
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    // --- Education Actions ---
    const openEduModal = (index: number | null = null) => {
        if (index !== null) {
            setEduForm(education[index]);
            setEditingIndex(index);
        } else {
            setEduForm({ institution: "", degree: "", startYear: "", endYear: "" });
            setEditingIndex(null);
        }
        setIsEduModalVisible(true);
    };

    const saveEducation = () => {
        if (!eduForm.institution || !eduForm.degree) {
            Alert.alert("Missing Info", "Please provide at least institution and degree.");
            return;
        }
        if (editingIndex !== null) {
            const newEdu = [...education];
            newEdu[editingIndex] = eduForm;
            setEducation(newEdu);
        } else {
            setEducation([...education, eduForm]);
        }
        setIsEduModalVisible(false);
    };

    const deleteEducation = (index: number) => {
        Alert.alert("Delete", "Are you sure you want to remove this education entry?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => {
                setEducation(education.filter((_, i) => i !== index));
            }}
        ]);
    };

    // --- Experience Actions ---
    const openExpModal = (index: number | null = null) => {
        if (index !== null) {
            setExpForm(experience[index]);
            setEditingIndex(index);
        } else {
            setExpForm({ company: "", role: "", startYear: "", endYear: "", description: "" });
            setEditingIndex(null);
        }
        setIsExpModalVisible(true);
    };

    const saveExperience = () => {
        if (!expForm.company || !expForm.role) {
            Alert.alert("Missing Info", "Please provide at least company and role.");
            return;
        }
        if (editingIndex !== null) {
            const newExp = [...experience];
            newExp[editingIndex] = expForm;
            setExperience(newExp);
        } else {
            setExperience([...experience, expForm]);
        }
        setIsExpModalVisible(false);
    };

    const deleteExperience = (index: number) => {
        Alert.alert("Delete", "Are you sure you want to remove this experience entry?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => {
                setExperience(experience.filter((_, i) => i !== index));
            }}
        ]);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            {/* Custom Header */}
            <View style={[styles.header, { paddingTop: topInsetOffset + 10, backgroundColor: colors.headerBackground }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.saveBtnText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Basic Info Section */}
                <SectionHeader title="Basic Info" icon="user" colors={colors} />
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Tagline</Text>
                    <TextInput
                        style={[styles.input, { color: colors.foreground, backgroundColor: colors.muted + "10", borderColor: colors.border }]}
                        value={tagline}
                        onChangeText={setTagline}
                        placeholder="e.g. Senior Product Designer"
                        placeholderTextColor={colors.mutedForeground}
                    />
                    
                    <Text style={[styles.inputLabel, { color: colors.mutedForeground, marginTop: 12 }]}>Location</Text>
                    <TextInput
                        style={[styles.input, { color: colors.foreground, backgroundColor: colors.muted + "10", borderColor: colors.border }]}
                        value={location}
                        onChangeText={setLocation}
                        placeholder="e.g. New York, USA"
                        placeholderTextColor={colors.mutedForeground}
                    />

                    <Text style={[styles.inputLabel, { color: colors.mutedForeground, marginTop: 12 }]}>Bio</Text>
                    <TextInput
                        style={[styles.textArea, { color: colors.foreground, backgroundColor: colors.muted + "10", borderColor: colors.border }]}
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        numberOfLines={4}
                        placeholder="Tell us about yourself..."
                        placeholderTextColor={colors.mutedForeground}
                    />
                </View>

                {user?.role === "freelancer" && (
                    <>
                        <SectionHeader title="Portfolio link" icon="link" colors={colors} />
                        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>
                                Website (Behance, Dribbble, personal site)
                            </Text>
                            <TextInput
                                style={[styles.input, { color: colors.foreground, backgroundColor: colors.muted + "10", borderColor: colors.border }]}
                                value={portfolioUrl}
                                onChangeText={setPortfolioUrl}
                                placeholder="https://"
                                placeholderTextColor={colors.mutedForeground}
                                keyboardType="url"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                    </>
                )}

                {/* Education Section */}
                <View style={styles.sectionHeaderRow}>
                    <SectionHeader title="Education" icon="book" colors={colors} />
                    <TouchableOpacity style={[styles.addInlineBtn, { backgroundColor: colors.primary + "10" }]} onPress={() => openEduModal()}>
                        <Feather name="plus" size={16} color={colors.primary} />
                        <Text style={[styles.addInlineLabel, { color: colors.primary }]}>Add</Text>
                    </TouchableOpacity>
                </View>

                {education.length > 0 ? (
                    education.map((edu, idx) => (
                        <HistoryItem 
                            key={`edu-${idx}`}
                            title={edu.degree}
                            subtitle={edu.institution}
                            date={`${edu.startYear} - ${edu.endYear}`}
                            icon="book"
                            colors={colors}
                            onEdit={() => openEduModal(idx)}
                            onDelete={() => deleteEducation(idx)}
                        />
                    ))
                ) : (
                    <EmptyHistory placeholder="No education history added yet." colors={colors} />
                )}

                {/* Experience Section */}
                <View style={styles.sectionHeaderRow}>
                    <SectionHeader title="Experience" icon="award" colors={colors} />
                    <TouchableOpacity style={[styles.addInlineBtn, { backgroundColor: colors.primary + "10" }]} onPress={() => openExpModal()}>
                        <Feather name="plus" size={16} color={colors.primary} />
                        <Text style={[styles.addInlineLabel, { color: colors.primary }]}>Add</Text>
                    </TouchableOpacity>
                </View>

                {experience.length > 0 ? (
                    experience.map((exp, idx) => (
                        <HistoryItem 
                            key={`exp-${idx}`}
                            title={exp.role}
                            subtitle={exp.company}
                            date={`${exp.startYear} - ${exp.endYear}`}
                            icon="award"
                            colors={colors}
                            onEdit={() => openExpModal(idx)}
                            onDelete={() => deleteExperience(idx)}
                        />
                    ))
                ) : (
                    <EmptyHistory placeholder="No work experience added yet." colors={colors} />
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Modal: Add/Edit Education */}
            <Modal visible={isEduModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.foreground }]}>{editingIndex !== null ? "Edit Education" : "Add Education"}</Text>
                        
                        <ScrollView style={{ maxHeight: 400 }}>
                            <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Institution</Text>
                            <TextInput 
                                style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border }]} 
                                value={eduForm.institution} 
                                onChangeText={t => setEduForm({...eduForm, institution: t})}
                            />

                            <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Degree</Text>
                            <TextInput 
                                style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border }]} 
                                value={eduForm.degree} 
                                onChangeText={t => setEduForm({...eduForm, degree: t})}
                            />

                            <View style={styles.modalRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Start Year</Text>
                                    <TextInput 
                                        style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border }]} 
                                        value={eduForm.startYear} 
                                        onChangeText={t => setEduForm({...eduForm, startYear: t.replace(/[^0-9]/g, "")})}
                                        keyboardType="number-pad"
                                        maxLength={4}
                                    />
                                </View>
                                <View style={{ width: 16 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>End Year</Text>
                                    <TextInput 
                                        style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border }]} 
                                        value={eduForm.endYear} 
                                        onChangeText={t => setEduForm({...eduForm, endYear: t})}
                                        placeholder="or Present"
                                        placeholderTextColor={colors.mutedForeground}
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: colors.border }]} onPress={() => setIsEduModalVisible(false)}>
                                <Text style={[styles.modalCancelText, { color: colors.foreground }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: colors.buttonPrimary }]} onPress={saveEducation}>
                                <Text style={[styles.modalSaveText, { color: colors.onButtonPrimary }]}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal: Add/Edit Experience */}
            <Modal visible={isExpModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.foreground }]}>{editingIndex !== null ? "Edit Experience" : "Add Experience"}</Text>
                        
                        <ScrollView style={{ maxHeight: 450 }}>
                            <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Company</Text>
                            <TextInput 
                                style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border }]} 
                                value={expForm.company} 
                                onChangeText={t => setExpForm({...expForm, company: t})}
                            />

                            <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Role</Text>
                            <TextInput 
                                style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border }]} 
                                value={expForm.role} 
                                onChangeText={t => setExpForm({...expForm, role: t})}
                            />

                            <View style={styles.modalRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Start Year</Text>
                                    <TextInput 
                                        style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border }]} 
                                        value={expForm.startYear} 
                                        onChangeText={t => setExpForm({...expForm, startYear: t.replace(/[^0-9]/g, "")})}
                                        keyboardType="number-pad"
                                        maxLength={4}
                                    />
                                </View>
                                <View style={{ width: 16 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>End Year</Text>
                                    <TextInput 
                                        style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border }]} 
                                        value={expForm.endYear} 
                                        onChangeText={t => setExpForm({...expForm, endYear: t})}
                                        placeholder="or Present"
                                        placeholderTextColor={colors.mutedForeground}
                                    />
                                </View>
                            </View>

                            <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Description</Text>
                            <TextInput 
                                style={[styles.modalInput, { height: 80, paddingVertical: 10, textAlignVertical: "top", color: colors.foreground, borderColor: colors.border }]} 
                                value={expForm.description} 
                                onChangeText={t => setExpForm({...expForm, description: t})}
                                multiline
                            />
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: colors.border }]} onPress={() => setIsExpModalVisible(false)}>
                                <Text style={[styles.modalCancelText, { color: colors.foreground }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: colors.buttonPrimary }]} onPress={saveExperience}>
                                <Text style={[styles.modalSaveText, { color: colors.onButtonPrimary }]}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

// --- Helper Components ---

function SectionHeader({ title, icon, colors }: { title: string; icon: string; colors: any }) {
    return (
        <View style={styles.sectionHeader}>
            <Feather name={icon as any} size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
        </View>
    );
}

function HistoryItem({ title, subtitle, date, icon, colors, onEdit, onDelete }: any) {
    return (
        <View style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.historyIconBox, { backgroundColor: colors.primary + "10" }]}>
                <Feather name={icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.historyInfo}>
                <Text style={[styles.historyTitle, { color: colors.foreground }]} numberOfLines={1}>{title}</Text>
                <Text style={[styles.historySubtitle, { color: colors.mutedForeground }]} numberOfLines={1}>{subtitle}</Text>
                <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>{date}</Text>
            </View>
            <View style={styles.historyActions}>
                <TouchableOpacity onPress={onEdit} style={styles.actionIconButton}>
                    <Feather name="edit-2" size={18} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onDelete} style={styles.actionIconButton}>
                    <Feather name="trash-2" size={18} color={colors.destructive} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

function EmptyHistory({ placeholder, colors }: { placeholder: string, colors: any }) {
    return (
        <View style={[styles.emptyCard, { borderColor: colors.border }]}>
            <Text style={{ color: colors.mutedForeground, fontStyle: "italic", fontSize: 13 }}>{placeholder}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    backBtn: { padding: 4 },
    headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
    saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    scrollContent: { padding: 20 },
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12, marginTop: 10 },
    sectionTitle: { fontSize: 16, fontWeight: "800" },
    sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 20 },
    card: { padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 10 },
    inputLabel: { fontSize: 12, fontWeight: "700", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
    input: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, borderWidth: 1 },
    textArea: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, height: 100, textAlignVertical: "top", borderWidth: 1 },
    addInlineBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    addInlineLabel: { fontSize: 13, fontWeight: "700" },
    historyCard: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 18, borderWidth: 1, marginBottom: 12, gap: 12 },
    historyIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    historyInfo: { flex: 1 },
    historyTitle: { fontSize: 15, fontWeight: "700" },
    historySubtitle: { fontSize: 13, fontWeight: "500", marginTop: 2 },
    historyDate: { fontSize: 11, fontWeight: "400", marginTop: 4 },
    historyActions: { flexDirection: "row", gap: 4 },
    actionIconButton: { padding: 8 },
    emptyCard: { padding: 20, borderRadius: 18, borderWidth: 1, borderStyle: "dashed", alignItems: "center", justifyContent: "center" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: Platform.OS === "ios" ? 40 : 24 },
    modalTitle: { fontSize: 20, fontWeight: "800", marginBottom: 20, textAlign: "center" },
    modalLabel: { fontSize: 13, fontWeight: "700", marginBottom: 8, marginTop: 16 },
    modalInput: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, borderWidth: 1 },
    modalRow: { flexDirection: "row" },
    modalActions: { flexDirection: "row", gap: 12, marginTop: 24 },
    modalCancelBtn: { flex: 1, height: 50, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
    modalCancelText: { fontSize: 16, fontWeight: "600" },
    modalSaveBtn: { flex: 2, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    modalSaveText: { fontSize: 16, fontWeight: "700" },
});
