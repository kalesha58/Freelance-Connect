import React, { useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Platform,
    Modal,
    Alert,
    ActivityIndicator,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat/KeyboardAwareScrollViewCompat";

function formatFollowCount(n?: number) {
    if (typeof n === "number" && !Number.isNaN(n)) return String(n);
    return "0";
}

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
    const [services, setServices] = useState<string[]>(user?.services || []);
    const [newService, setNewService] = useState("");


    // Item Edit Modal State
    const [isEduModalVisible, setIsEduModalVisible] = useState(false);
    const [isExpModalVisible, setIsExpModalVisible] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Temp Form State (Education)
    const [eduForm, setEduForm] = useState({ institution: "", degree: "", startYear: "", endYear: "", currentlyStudying: false });
    // Temp Form State (Experience)
    const [expForm, setExpForm] = useState({ company: "", role: "", startYear: "", endYear: "", description: "", currentlyWorking: false });

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
                services,
                portfolioUrl: portfolioUrl.trim(),

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
            setEduForm({
                ...education[index],
                currentlyStudying: education[index].endYear === "Present" || education[index].endYear === new Date().getFullYear().toString()
            });
            setEditingIndex(index);
        } else {
            setEduForm({ institution: "", degree: "", startYear: "", endYear: "", currentlyStudying: false });
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
            setExpForm({
                ...experience[index],
                currentlyWorking: experience[index].endYear === "Present" || experience[index].endYear === new Date().getFullYear().toString()
            });
            setEditingIndex(index);
        } else {
            setExpForm({ company: "", role: "", startYear: "", endYear: "", description: "", currentlyWorking: false });
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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
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

            <KeyboardAwareScrollViewCompat contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

                <SectionHeader title="Portfolio link" icon="link" colors={colors} />
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>
                        Website (Behance, Dribbble, personal site)
                    </Text>
                    <View style={styles.portfolioInputRow}>
                        <Feather name="globe" size={18} color={colors.mutedForeground} style={styles.inputIconLeft} />
                        <TextInput
                            style={[styles.input, { flex: 1, color: colors.foreground, backgroundColor: colors.muted + "10", borderColor: "transparent", paddingLeft: 40 }]}
                            value={portfolioUrl}
                            onChangeText={setPortfolioUrl}
                            placeholder="https://yourportfolio.com"
                            placeholderTextColor={colors.mutedForeground}
                            keyboardType="url"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>
                </View>

                <SectionHeader title="Your Services" icon="settings" colors={colors} />
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Add a service (e.g. Graphic Design)</Text>
                    <View style={styles.addServiceRow}>
                        <TextInput
                            style={[styles.input, { flex: 1, color: colors.foreground, backgroundColor: colors.muted + "10", borderColor: colors.border }]}
                            value={newService}
                            onChangeText={setNewService}
                            placeholder="Type a service..."
                            placeholderTextColor={colors.mutedForeground}
                        />
                        <TouchableOpacity 
                            style={[styles.addBtnSmall, { backgroundColor: colors.primary }]}
                            onPress={() => {
                                if (newService.trim()) {
                                    if (!services.includes(newService.trim())) {
                                        setServices([...services, newService.trim()]);
                                    }
                                    setNewService("");
                                }
                            }}
                        >
                            <Feather name="plus" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    
                    {services.length > 0 && (
                        <View style={styles.servicesChipContainer}>
                            {services.map((s, idx) => (
                                <View key={idx} style={[styles.serviceChip, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
                                    <Text style={[styles.serviceChipText, { color: colors.primary }]}>{s}</Text>
                                    <TouchableOpacity onPress={() => setServices(services.filter((_, i) => i !== idx))}>
                                        <Feather name="x" size={14} color={colors.primary} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}
                </View>


                {user?.role === "freelancer" && (
                    <>
                        <SectionHeader title="Network" icon="users" colors={colors} />
                        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, padding: 0 }]}>
                            <TouchableOpacity
                                style={[styles.networkRow, { borderBottomColor: colors.border }]}
                                onPress={() => navigation.navigate("FollowList", { mode: "following" })}
                            >
                                <View style={styles.networkRowLeft}>
                                    <Feather name="user-plus" size={18} color={colors.primary} />
                                    <Text style={[styles.networkRowLabel, { color: colors.foreground }]}>Following</Text>
                                </View>
                                <Text style={[styles.networkRowMeta, { color: colors.mutedForeground }]}>
                                    {formatFollowCount(user?.following)}
                                </Text>
                                <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.networkRow}
                                onPress={() => navigation.navigate("FollowList", { mode: "followers" })}
                            >
                                <View style={styles.networkRowLeft}>
                                    <Feather name="users" size={18} color={colors.purpleAccent} />
                                    <Text style={[styles.networkRowLabel, { color: colors.foreground }]}>Followers</Text>
                                </View>
                                <Text style={[styles.networkRowMeta, { color: colors.mutedForeground }]}>
                                    {formatFollowCount(user?.followers)}
                                </Text>
                                <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.networkHint, { color: colors.mutedForeground }]}>
                            Freelancers you follow and who follow you back. Discover more from Jobs and Community.
                        </Text>
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
            </KeyboardAwareScrollViewCompat>

            {/* Modal: Add/Edit Education */}
            <Modal visible={isEduModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsEduModalVisible(false)} />
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                    >
                        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: colors.foreground }]}>{editingIndex !== null ? "Edit Education" : "Add Education"}</Text>
                                <TouchableOpacity onPress={() => setIsEduModalVisible(false)}>
                                    <Feather name="x" size={20} color={colors.mutedForeground} />
                                </TouchableOpacity>
                            </View>
                            
                            <KeyboardAwareScrollViewCompat style={{ maxHeight: 450 }} showsVerticalScrollIndicator={false}>
                                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Institution</Text>
                                <TextInput 
                                    style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted + "05" }]} 
                                    value={eduForm.institution} 
                                    onChangeText={t => setEduForm({...eduForm, institution: t})}
                                    placeholder="e.g. Stanford University"
                                    placeholderTextColor={colors.mutedForeground}
                                />

                                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Degree</Text>
                                <TextInput 
                                    style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted + "05" }]} 
                                    value={eduForm.degree} 
                                    onChangeText={t => setEduForm({...eduForm, degree: t})}
                                    placeholder="e.g. Bachelor of Science in Design"
                                    placeholderTextColor={colors.mutedForeground}
                                />

                                <View style={styles.checkboxRow}>
                                    <TouchableOpacity 
                                        style={[styles.checkbox, { borderColor: eduForm.currentlyStudying ? colors.primary : colors.border, backgroundColor: eduForm.currentlyStudying ? colors.primary : "transparent" }]}
                                        onPress={() => {
                                            const newState = !eduForm.currentlyStudying;
                                            setEduForm({
                                                ...eduForm,
                                                currentlyStudying: newState,
                                                endYear: newState ? new Date().getFullYear().toString() : ""
                                            });
                                        }}
                                    >
                                        {eduForm.currentlyStudying && <Feather name="check" size={12} color="#fff" />}
                                    </TouchableOpacity>
                                    <Text style={[styles.checkboxLabel, { color: colors.foreground }]}>I am currently studying here</Text>
                                </View>

                                <View style={styles.modalRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Start Year</Text>
                                        <TextInput 
                                            style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted + "05" }]} 
                                            value={eduForm.startYear} 
                                            onChangeText={t => setEduForm({...eduForm, startYear: t.replace(/[^0-9]/g, "")})}
                                            keyboardType="number-pad"
                                            maxLength={4}
                                            placeholder="YYYY"
                                            placeholderTextColor={colors.mutedForeground}
                                        />
                                    </View>
                                    <View style={{ width: 16 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>End Year</Text>
                                        <TextInput 
                                            style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: eduForm.currentlyStudying ? colors.muted + "10" : colors.muted + "05" }]} 
                                            value={eduForm.endYear} 
                                            onChangeText={t => setEduForm({...eduForm, endYear: t})}
                                            placeholder="or Present"
                                            placeholderTextColor={colors.mutedForeground}
                                            editable={!eduForm.currentlyStudying}
                                        />
                                    </View>
                                </View>
                            </KeyboardAwareScrollViewCompat>

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: colors.border }]} onPress={() => setIsEduModalVisible(false)}>
                                    <Text style={[styles.modalCancelText, { color: colors.foreground }]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: colors.buttonPrimary }]} onPress={saveEducation}>
                                    <Text style={[styles.modalSaveText, { color: colors.onButtonPrimary }]}>Done</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* Modal: Add/Edit Experience */}
            <Modal visible={isExpModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsExpModalVisible(false)} />
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                    >
                        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: colors.foreground }]}>{editingIndex !== null ? "Edit Experience" : "Add Experience"}</Text>
                                <TouchableOpacity onPress={() => setIsExpModalVisible(false)}>
                                    <Feather name="x" size={20} color={colors.mutedForeground} />
                                </TouchableOpacity>
                            </View>
                            
                            <KeyboardAwareScrollViewCompat style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
                                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Company</Text>
                                <TextInput 
                                    style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted + "05" }]} 
                                    value={expForm.company} 
                                    onChangeText={t => setExpForm({...expForm, company: t})}
                                    placeholder="e.g. Google"
                                    placeholderTextColor={colors.mutedForeground}
                                />

                                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Role</Text>
                                <TextInput 
                                    style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted + "05" }]} 
                                    value={expForm.role} 
                                    onChangeText={t => setExpForm({...expForm, role: t})}
                                    placeholder="e.g. Senior Product Designer"
                                    placeholderTextColor={colors.mutedForeground}
                                />

                                <View style={styles.checkboxRow}>
                                    <TouchableOpacity 
                                        style={[styles.checkbox, { borderColor: expForm.currentlyWorking ? colors.primary : colors.border, backgroundColor: expForm.currentlyWorking ? colors.primary : "transparent" }]}
                                        onPress={() => {
                                            const newState = !expForm.currentlyWorking;
                                            setExpForm({
                                                ...expForm,
                                                currentlyWorking: newState,
                                                endYear: newState ? new Date().getFullYear().toString() : ""
                                            });
                                        }}
                                    >
                                        {expForm.currentlyWorking && <Feather name="check" size={12} color="#fff" />}
                                    </TouchableOpacity>
                                    <Text style={[styles.checkboxLabel, { color: colors.foreground }]}>I am currently working in this role</Text>
                                </View>

                                <View style={styles.modalRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Start Year</Text>
                                        <TextInput 
                                            style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted + "05" }]} 
                                            value={expForm.startYear} 
                                            onChangeText={t => setExpForm({...expForm, startYear: t.replace(/[^0-9]/g, "")})}
                                            keyboardType="number-pad"
                                            maxLength={4}
                                            placeholder="YYYY"
                                            placeholderTextColor={colors.mutedForeground}
                                        />
                                    </View>
                                    <View style={{ width: 16 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>End Year</Text>
                                        <TextInput 
                                            style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: expForm.currentlyWorking ? colors.muted + "10" : colors.muted + "05" }]} 
                                            value={expForm.endYear} 
                                            onChangeText={t => setExpForm({...expForm, endYear: t})}
                                            placeholder="or Present"
                                            placeholderTextColor={colors.mutedForeground}
                                            editable={!expForm.currentlyWorking}
                                        />
                                    </View>
                                </View>

                                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Description</Text>
                                <TextInput 
                                    style={[styles.modalInput, { height: 100, paddingVertical: 10, textAlignVertical: "top", color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted + "05" }]} 
                                    value={expForm.description} 
                                    onChangeText={t => setExpForm({...expForm, description: t})}
                                    multiline
                                    placeholder="Describe your responsibilities and achievements..."
                                    placeholderTextColor={colors.mutedForeground}
                                />
                            </KeyboardAwareScrollViewCompat>

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: colors.border }]} onPress={() => setIsExpModalVisible(false)}>
                                    <Text style={[styles.modalCancelText, { color: colors.foreground }]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: colors.buttonPrimary }]} onPress={saveExperience}>
                                    <Text style={[styles.modalSaveText, { color: colors.onButtonPrimary }]}>Done</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
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
                <View style={styles.dateBadge}>
                    <Feather name="calendar" size={10} color={colors.mutedForeground} style={{ marginRight: 4 }} />
                    <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>{date}</Text>
                </View>
            </View>
            <View style={styles.historyActions}>
                <TouchableOpacity onPress={onEdit} style={[styles.actionIconButton, { backgroundColor: colors.primary + "10" }]}>
                    <Feather name="edit-2" size={14} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onDelete} style={[styles.actionIconButton, { backgroundColor: colors.destructive + "10" }]}>
                    <Feather name="trash-2" size={14} color={colors.destructive} />
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
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    backBtn: { padding: 4 },
    headerTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
    saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
    scrollContent: { padding: 16 },
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10, marginTop: 8 },
    sectionTitle: { fontSize: 14, fontWeight: "800" },
    sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, marginTop: 16 },
    card: { padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
    inputLabel: { fontSize: 11, fontWeight: "700", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.3 },
    input: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, borderWidth: 1 },
    textArea: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, height: 90, textAlignVertical: "top", borderWidth: 1 },
    addInlineBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    addInlineLabel: { fontSize: 12, fontWeight: "700" },
    historyCard: { 
        flexDirection: "row", 
        alignItems: "center", 
        padding: 16, 
        borderRadius: 18, 
        borderWidth: 1, 
        marginBottom: 12, 
        gap: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    historyIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    historyInfo: { flex: 1 },
    historyTitle: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
    historySubtitle: { fontSize: 13, fontWeight: "500", opacity: 0.8 },
    dateBadge: { flexDirection: "row", alignItems: "center", marginTop: 6 },
    historyDate: { fontSize: 11, fontWeight: "600" },
    historyActions: { flexDirection: "row", gap: 8 },
    actionIconButton: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
    emptyCard: { padding: 24, borderRadius: 18, borderWidth: 1, borderStyle: "dashed", alignItems: "center", justifyContent: "center" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
    modalContent: { 
        borderTopLeftRadius: 32, 
        borderTopRightRadius: 32, 
        padding: 24, 
        paddingBottom: Platform.OS === "ios" ? 40 : 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 20,
    },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: "800" },
    modalLabel: { fontSize: 12, fontWeight: "700", marginBottom: 8, marginTop: 16, textTransform: "uppercase", letterSpacing: 0.5 },
    modalInput: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, borderWidth: 1 },
    modalRow: { flexDirection: "row" },
    modalActions: { flexDirection: "row", gap: 12, marginTop: 28 },
    modalCancelBtn: { flex: 1, height: 50, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
    modalCancelText: { fontSize: 15, fontWeight: "600" },
    modalSaveBtn: { flex: 2, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    modalSaveText: { fontSize: 15, fontWeight: "700" },
    checkboxRow: { flexDirection: "row", alignItems: "center", marginTop: 20, marginBottom: 4 },
    checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginRight: 10 },
    checkboxLabel: { fontSize: 14, fontWeight: "600" },
    networkRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: 8,
    },
    networkRowLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
    networkRowLabel: { fontSize: 14, fontWeight: "600" },
    networkRowMeta: { fontSize: 13, fontWeight: "600", marginRight: 2 },
    networkHint: { fontSize: 11, lineHeight: 16, marginTop: 6, marginBottom: 6, paddingHorizontal: 4 },
    addServiceRow: { flexDirection: "row", gap: 8, alignItems: "center" },
    addBtnSmall: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    servicesChipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
    serviceChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
    serviceChipText: { fontSize: 12, fontWeight: "600" },
    portfolioInputRow: { position: "relative", justifyContent: "center" },
    inputIconLeft: { position: "absolute", left: 14, zIndex: 1 },
});
