import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Platform,
    Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat/KeyboardAwareScrollViewCompat";
import { apiClient } from "@/utils/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const USERNAME_REGEX = /^[A-Za-z0-9_]{3,20}$/;
type UsernameCheckState = "idle" | "checking" | "available" | "taken" | "invalid" | "error";

const FREELANCER_STEPS = [
    { title: "Personal Info", icon: "user" },
    { title: "Services", icon: "briefcase" },
    { title: "Education", icon: "book" },
    { title: "Experience", icon: "award" },
    { title: "Portfolio", icon: "link" },
];

const HIRING_STEPS = [
    { title: "Company Info", icon: "briefcase" },
    { title: "About", icon: "info" },
    { title: "Industry & Location", icon: "map-pin" },
];

export default function ProfileSetupScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { user, updateProfile } = useApp();

    const [currentStep, setCurrentStep] = useState(0);
    const [bio, setBio] = useState(user?.bio || "");
    const [tagline, setTagline] = useState(user?.tagline || "");
    const [username, setUsername] = useState(user?.username || "");
    const [usernameState, setUsernameState] = useState<UsernameCheckState>(user?.username ? "available" : "idle");
    const [usernameMessage, setUsernameMessage] = useState("");
    const [services, setServices] = useState<string[]>(user?.services || []);
    const [newService, setNewService] = useState("");

    // Hiring specific state
    const [companyName, setCompanyName] = useState(user?.companyName || "");
    const [companyWebsite, setCompanyWebsite] = useState(user?.companyWebsite || "");
    const [location, setLocation] = useState(user?.location || "");
    const [industry, setIndustry] = useState(user?.industry || "");

    // Education state
    const [education, setEducation] = useState(user?.education || []);
    const [eduInstitution, setEduInstitution] = useState("");
    const [eduDegree, setEduDegree] = useState("");
    const [eduStart, setEduStart] = useState("");
    const [eduEnd, setEduEnd] = useState("");

    // Experience state
    const [experience, setExperience] = useState(user?.experience || []);
    const [expCompany, setExpCompany] = useState("");
    const [expRole, setExpRole] = useState("");
    const [expStart, setExpStart] = useState("");
    const [expEnd, setExpEnd] = useState("");
    const [expDesc, setExpDesc] = useState("");
    const [portfolioUrl, setPortfolioUrl] = useState((user as { portfolioUrl?: string })?.portfolioUrl || "");
    const [workStatus, setWorkStatus] = useState<"none" | "freelance" | "company">("none");

    const isHiring = user?.role === "hiring" || user?.role === "requester";
    const STEPS = isHiring ? HIRING_STEPS : FREELANCER_STEPS;
    const currentUsernameLower = (user?.username || "").trim().toLowerCase();
    const STORAGE_KEY = `PROFILE_SETUP_PROGRESS_${user?._id || "guest"}`;

    // Load progress on mount
    useEffect(() => {
        const loadProgress = async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.currentStep !== undefined) setCurrentStep(data.currentStep);
                    if (data.bio) setBio(data.bio);
                    if (data.tagline) setTagline(data.tagline);
                    if (data.username) setUsername(data.username);
                    if (data.services) setServices(data.services);
                    if (data.companyName) setCompanyName(data.companyName);
                    if (data.companyWebsite) setCompanyWebsite(data.companyWebsite);
                    if (data.location) setLocation(data.location);
                    if (data.industry) setIndustry(data.industry);
                    if (data.education) setEducation(data.education);
                    if (data.experience) setExperience(data.experience);
                    if (data.portfolioUrl) setPortfolioUrl(data.portfolioUrl);
                    if (data.workStatus) setWorkStatus(data.workStatus);

                    // Temp fields
                    if (data.eduInstitution) setEduInstitution(data.eduInstitution);
                    if (data.eduDegree) setEduDegree(data.eduDegree);
                    if (data.eduStart) setEduStart(data.eduStart);
                    if (data.eduEnd) setEduEnd(data.eduEnd);
                    if (data.expCompany) setExpCompany(data.expCompany);
                    if (data.expRole) setExpRole(data.expRole);
                    if (data.expStart) setExpStart(data.expStart);
                    if (data.expEnd) setExpEnd(data.expEnd);
                    if (data.expDesc) setExpDesc(data.expDesc);
                }
            } catch (e) {
                console.error("Failed to load profile setup progress", e);
            }
        };
        loadProgress();
    }, []);

    // Save progress on state change
    useEffect(() => {
        const saveProgress = async () => {
            try {
                const data = {
                    currentStep,
                    bio,
                    tagline,
                    username,
                    services,
                    companyName,
                    companyWebsite,
                    location,
                    industry,
                    education,
                    experience,
                    portfolioUrl,
                    workStatus,
                    eduInstitution,
                    eduDegree,
                    eduStart,
                    eduEnd,
                    expCompany,
                    expRole,
                    expStart,
                    expEnd,
                    expDesc
                };
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            } catch (e) {
                console.error("Failed to save profile setup progress", e);
            }
        };

        // Debounce save to avoid excessive writes
        const timer = setTimeout(saveProgress, 1000);
        return () => clearTimeout(timer);
    }, [
        currentStep, bio, tagline, username, services, 
        companyName, companyWebsite, location, industry, 
        education, experience, portfolioUrl, workStatus,
        eduInstitution, eduDegree, eduStart, eduEnd,
        expCompany, expRole, expStart, expEnd, expDesc
    ]);

    useEffect(() => {
        const trimmed = username.trim();
        if (!trimmed) {
            setUsernameState("idle");
            setUsernameMessage("Choose a username to continue.");
            return;
        }
        if (!USERNAME_REGEX.test(trimmed)) {
            setUsernameState("invalid");
            setUsernameMessage("Use 3-20 characters: letters, numbers, and underscores.");
            return;
        }
        if (trimmed.toLowerCase() === currentUsernameLower && currentUsernameLower) {
            setUsernameState("available");
            setUsernameMessage("Username looks good.");
            return;
        }

        let cancelled = false;
        setUsernameState("checking");
        setUsernameMessage("Checking availability...");
        const timer = setTimeout(async () => {
            try {
                const result = await apiClient(`/users/username-available?username=${encodeURIComponent(trimmed)}`);
                if (cancelled) return;
                if (result?.available) {
                    setUsernameState("available");
                    setUsernameMessage("Username is available.");
                } else {
                    setUsernameState("taken");
                    setUsernameMessage("Username is already taken.");
                }
            } catch (error: any) {
                if (cancelled) return;
                const message = String(error?.message || "");
                if (message.toLowerCase().includes("letters, numbers, and underscores")) {
                    setUsernameState("invalid");
                    setUsernameMessage(message);
                } else {
                    setUsernameState("error");
                    setUsernameMessage("Could not verify username. Please try again.");
                }
            }
        }, 450);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [username, currentUsernameLower]);

    const addService = () => {
        if (newService.trim()) {
            setServices([...services, newService.trim()]);
            setNewService("");
        }
    };

    const removeService = (index: number) => {
        setServices(services.filter((_, i) => i !== index));
    };

    const addEducation = () => {
        if (eduInstitution && eduDegree) {
            setEducation([...education, {
                institution: eduInstitution,
                degree: eduDegree,
                startYear: eduStart,
                endYear: eduEnd
            }]);
            setEduInstitution("");
            setEduDegree("");
            setEduStart("");
            setEduEnd("");
        }
    };

    const addExperience = () => {
        if (expCompany && expRole) {
            setExperience([...experience, {
                company: expCompany,
                role: expRole,
                startYear: expStart,
                endYear: expEnd,
                description: expDesc
            }]);
            setExpCompany("");
            setExpRole("");
            setExpStart("");
            setExpEnd("");
            setExpDesc("");
        }
    };

    const isNextDisabled = () => {
        if (isHiring) {
            switch (currentStep) {
                case 0: return companyName.trim().length < 2 || usernameState !== "available";
                case 1: return bio.trim().length < 10;
                case 2: return industry.trim().length < 2 || location.trim().length < 2;
                default: return false;
            }
        } else {
            switch (currentStep) {
                case 0: return bio.trim().length < 10 || usernameState !== "available"; // Bio at least 10 chars
                case 1: return services.length === 0;
                case 2: return education.length === 0;
                case 3: return experience.length === 0;
                case 4: return false;
                default: return false;
            }
        }
    };

    const handleNext = () => {
        if (isNextDisabled()) return;

        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        const profileData: any = {
            bio,
            tagline,
            location,
            username: username.trim(),
            isProfileComplete: true
        };

        if (isHiring) {
            profileData.companyName = companyName;
            profileData.companyWebsite = companyWebsite;
            profileData.industry = industry;
        } else {
            profileData.services = services;
            profileData.education = education;
            profileData.experience = experience;
            profileData.portfolioUrl = portfolioUrl.trim();
        }

        try {
            await updateProfile(profileData);
            await AsyncStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error("Update Profile Error:", error);
            const errorMessage = String((error as Error)?.message || "");
            if (errorMessage.toLowerCase().includes("username is already taken")) {
                setUsernameState("taken");
                setUsernameMessage("Username is already taken.");
            }
        }
    };

    const renderStepContent = () => {
        if (isHiring) {
            switch (currentStep) {
                case 0:
                    return (
                        <View style={styles.stepContainer}>
                            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Company Details</Text>
                            <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
                                Tell us about your organization or personal brand.
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.muted + "10", color: colors.foreground, borderColor: colors.border }]}
                                placeholder="Username (e.g. AcmeStudio)"
                                placeholderTextColor={colors.mutedForeground}
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <Text style={[
                                styles.usernameStatus,
                                {
                                    color:
                                        usernameState === "available"
                                            ? colors.buttonPrimary
                                            : usernameState === "taken" || usernameState === "invalid" || usernameState === "error"
                                                ? colors.destructive
                                                : colors.mutedForeground
                                }
                            ]}>
                                {usernameMessage}
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.muted + "10", color: colors.foreground, borderColor: colors.border }]}
                                placeholder="Company Name"
                                placeholderTextColor={colors.mutedForeground}
                                value={companyName}
                                onChangeText={setCompanyName}
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.muted + "10", color: colors.foreground, borderColor: colors.border }]}
                                placeholder="Company Website (Optional)"
                                placeholderTextColor={colors.mutedForeground}
                                value={companyWebsite}
                                onChangeText={setCompanyWebsite}
                                keyboardType="url"
                                autoCapitalize="none"
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.muted + "10", color: colors.foreground, borderColor: colors.border }]}
                                placeholder="Professional Tagline"
                                placeholderTextColor={colors.mutedForeground}
                                value={tagline}
                                onChangeText={setTagline}
                            />
                        </View>
                    );
                case 1:
                    return (
                        <View style={styles.stepContainer}>
                            <Text style={[styles.stepTitle, { color: colors.foreground }]}>About Your Company</Text>
                            <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
                                Describe what your company does and what kind of talent you're looking for.
                            </Text>
                            <TextInput
                                style={[styles.textArea, { backgroundColor: colors.muted + "10", color: colors.foreground, borderColor: colors.border }]}
                                placeholder="e.g. We are a startup focused on AI solutions..."
                                placeholderTextColor={colors.mutedForeground}
                                multiline
                                numberOfLines={6}
                                value={bio}
                                onChangeText={setBio}
                            />
                        </View>
                    );
                case 2:
                    return (
                        <View style={styles.stepContainer}>
                            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Industry & Location</Text>
                            <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
                                Help freelancers know where you're based and your field of work.
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.muted + "10", color: colors.foreground, borderColor: colors.border }]}
                                placeholder="Industry (e.g. Technology, Healthcare)"
                                placeholderTextColor={colors.mutedForeground}
                                value={industry}
                                onChangeText={setIndustry}
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.muted + "10", color: colors.foreground, borderColor: colors.border }]}
                                placeholder="Location (e.g. New York, USA)"
                                placeholderTextColor={colors.mutedForeground}
                                value={location}
                                onChangeText={setLocation}
                            />
                        </View>
                    );
                default: return null;
            }
        }

        // Freelancer steps
        switch (currentStep) {
            case 0:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: colors.foreground }]}>
                            Tell us about yourself, {user?.name?.split(' ')[0] || 'there'}
                        </Text>
                        <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
                            Write a brief bio that highlights your passion and expertise.
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.muted + "10", color: colors.foreground, borderColor: colors.border, marginBottom: 12 }]}
                            placeholder="Username (e.g. dev_Sara)"
                            placeholderTextColor={colors.mutedForeground}
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <Text style={[
                            styles.usernameStatus,
                            {
                                color:
                                    usernameState === "available"
                                        ? colors.buttonPrimary
                                        : usernameState === "taken" || usernameState === "invalid" || usernameState === "error"
                                            ? colors.destructive
                                            : colors.mutedForeground
                            }
                        ]}>
                            {usernameMessage}
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.muted + "10", color: colors.foreground, borderColor: colors.border, marginBottom: 12 }]}
                            placeholder="Professional Tagline (e.g. Senior Mobile Developer)"
                            placeholderTextColor={colors.mutedForeground}
                            value={tagline}
                            onChangeText={setTagline}
                        />
                        <TextInput
                            style={[styles.textArea, { backgroundColor: colors.muted + "10", color: colors.foreground, borderColor: colors.border }]}
                            placeholder="Tell us more about your background..."
                            placeholderTextColor={colors.mutedForeground}
                            multiline
                            numberOfLines={6}
                            value={bio}
                            onChangeText={setBio}
                        />
                    </View>
                );
            case 1:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: colors.foreground }]}>What services do you offer?</Text>
                        <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
                            Add the categories or skills you want to be hired for.
                        </Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={[styles.input, { flex: 1, backgroundColor: colors.muted + "10", color: colors.foreground, borderColor: colors.border }]}
                                placeholder="e.g. Wedding Photography"
                                placeholderTextColor={colors.mutedForeground}
                                value={newService}
                                onChangeText={setNewService}
                            />
                            <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.buttonPrimary }]} onPress={addService}>
                                <Feather name="plus" size={24} color={colors.onButtonPrimary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.tagCloud}>
                            {services.map((item, index) => (
                                <View key={index} style={[styles.tag, { backgroundColor: colors.primary + "15" }]}>
                                    <Text style={[styles.tagText, { color: colors.primary }]}>{item}</Text>
                                    <TouchableOpacity onPress={() => removeService(index)}>
                                        <Feather name="x" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                );
            case 2:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: colors.foreground }]}>Education</Text>
                        <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
                            Add your academic background.
                        </Text>

                        {education.map((edu, idx) => (
                            <View key={idx} style={[styles.itemCard, { borderColor: colors.border }]}>
                                <Text style={[styles.itemTitle, { color: colors.foreground }]}>{edu.institution}</Text>
                                <Text style={[styles.itemSubtitle, { color: colors.mutedForeground }]}>{edu.degree}</Text>
                                <Text style={[styles.itemDate, { color: colors.mutedForeground }]}>{edu.startYear} - {edu.endYear}</Text>
                            </View>
                        ))}

                        <View style={[styles.form, { marginTop: 10 }]}>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.muted + "10", color: colors.foreground, borderColor: colors.border }]}
                                placeholder="Institution Name"
                                placeholderTextColor={colors.mutedForeground}
                                value={eduInstitution}
                                onChangeText={setEduInstitution}
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.muted + "10", color: colors.foreground, borderColor: colors.border }]}
                                placeholder="Degree / Certificate"
                                placeholderTextColor={colors.mutedForeground}
                                value={eduDegree}
                                onChangeText={setEduDegree}
                            />
                            <View style={styles.row}>
                                <TextInput
                                    style={[styles.input, { flex: 1, backgroundColor: colors.muted + "10", color: colors.foreground, borderColor: colors.border }]}
                                    placeholder="Start Year"
                                    placeholderTextColor={colors.mutedForeground}
                                    value={eduStart}
                                    onChangeText={(t) => setEduStart(t.replace(/[^0-9]/g, ''))}
                                    keyboardType="number-pad"
                                    maxLength={4}
                                />
                                <TextInput
                                    style={[styles.input, { flex: 1, backgroundColor: colors.muted + "10", color: colors.foreground, borderColor: colors.border }]}
                                    placeholder="End Year (or Present)"
                                    placeholderTextColor={colors.mutedForeground}
                                    value={eduEnd}
                                    onChangeText={(t) => setEduEnd(t.replace(/[^0-9]/g, ''))}
                                    keyboardType="number-pad"
                                    maxLength={4}
                                />
                            </View>
                            <TouchableOpacity style={[styles.outlineBtn, { borderColor: colors.primary }]} onPress={addEducation}>
                                <Text style={{ color: colors.primary, fontWeight: '600' }}>Add Education</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 3:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: colors.foreground }]}>Work Experience</Text>
                        <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
                            Are you currently working or freelancing?
                        </Text>

                        <View style={styles.statusToggleRow}>
                            {[
                                { id: "freelance", label: "Freelancing", icon: "user-check" },
                                { id: "company", label: "At a Company", icon: "briefcase" },
                                { id: "none", label: "Not Working", icon: "x-circle" },
                            ].map((opt) => (
                                <TouchableOpacity
                                    key={opt.id}
                                    style={[
                                        styles.statusToggleBtn,
                                        { 
                                            backgroundColor: workStatus === opt.id ? colors.primary : colors.muted + "15",
                                            borderColor: workStatus === opt.id ? colors.primary : colors.border
                                        }
                                    ]}
                                    onPress={() => {
                                        setWorkStatus(opt.id as any);
                                        if (opt.id === "freelance") {
                                            setExpCompany("Self-employed / Freelance");
                                            setExpRole("Freelancer");
                                            setExpStart(new Date().getFullYear().toString());
                                            setExpEnd("Present");
                                        } else if (opt.id === "none") {
                                            setExpCompany("");
                                            setExpRole("");
                                            setExpStart("");
                                            setExpEnd("");
                                        } else {
                                            setExpCompany("");
                                            setExpRole("");
                                            setExpStart("");
                                            setExpEnd("");
                                        }
                                    }}
                                >
                                    <Feather name={opt.icon as any} size={14} color={workStatus === opt.id ? "#fff" : colors.mutedForeground} />
                                    <Text style={[styles.statusToggleLabel, { color: workStatus === opt.id ? "#fff" : colors.foreground }]}>{opt.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <Text style={[styles.stepDesc, { color: colors.mutedForeground, marginTop: 10 }]}>
                            Add your detailed work history below.
                        </Text>

                        {experience.map((exp, idx) => (
                            <View key={idx} style={[styles.itemCard, { borderColor: colors.border }]}>
                                <Text style={[styles.itemTitle, { color: colors.foreground }]}>{exp.role} at {exp.company}</Text>
                                <Text style={[styles.itemDate, { color: colors.mutedForeground }]}>{exp.startYear} - {exp.endYear}</Text>
                            </View>
                        ))}

                        <View style={styles.form}>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.muted + "10", color: colors.foreground, borderColor: colors.border }]}
                                placeholder="Company Name"
                                placeholderTextColor={colors.mutedForeground}
                                value={expCompany}
                                onChangeText={setExpCompany}
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.muted + "10", color: colors.foreground, borderColor: colors.border }]}
                                placeholder="Role"
                                placeholderTextColor={colors.mutedForeground}
                                value={expRole}
                                onChangeText={setExpRole}
                            />
                            <View style={styles.row}>
                                <TextInput
                                    style={[styles.input, { flex: 1, backgroundColor: colors.muted + "10", color: colors.foreground, borderColor: colors.border }]}
                                    placeholder="Start Year"
                                    placeholderTextColor={colors.mutedForeground}
                                    value={expStart}
                                    onChangeText={(t) => setExpStart(t.replace(/[^0-9]/g, ''))}
                                    keyboardType="number-pad"
                                    maxLength={4}
                                />
                                <TextInput
                                    style={[styles.input, { flex: 1, backgroundColor: colors.muted + "10", color: colors.foreground, borderColor: colors.border }]}
                                    placeholder="End Year"
                                    placeholderTextColor={colors.mutedForeground}
                                    value={expEnd}
                                    onChangeText={(t) => setExpEnd(t.replace(/[^0-9]/g, ''))}
                                    keyboardType="number-pad"
                                    maxLength={4}
                                />
                            </View>
                            <TextInput
                                style={[styles.textArea, { height: 80, backgroundColor: colors.muted + "10", color: colors.foreground, borderColor: colors.border }]}
                                placeholder="Description"
                                placeholderTextColor={colors.mutedForeground}
                                multiline
                                value={expDesc}
                                onChangeText={setExpDesc}
                            />
                            <TouchableOpacity style={[styles.outlineBtn, { borderColor: colors.primary }]} onPress={addExperience}>
                                <Text style={{ color: colors.primary, fontWeight: '600' }}>Add Experience</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 4:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: colors.foreground }]}>Portfolio link</Text>
                        <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
                            Add a link to your online portfolio — Behance, Dribbble, your personal site, or GitHub. Hiring managers can open it in the app.
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.muted + "10", color: colors.foreground, borderColor: colors.border }]}
                            placeholder="https://behance.net/yourname"
                            placeholderTextColor={colors.mutedForeground}
                            value={portfolioUrl}
                            onChangeText={setPortfolioUrl}
                            keyboardType="url"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <Text style={[styles.stepDesc, { color: colors.mutedForeground, fontSize: 12, marginTop: 8 }]}>
                            Optional — you can skip and add this later from Edit Profile.
                        </Text>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <Text style={[styles.headerTitle, { color: colors.foreground }]}>Complete Your Profile</Text>
                <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>Step {currentStep + 1} of {STEPS.length}</Text>
            </View>

            <View style={styles.stepperContainer}>
                {STEPS.map((step, index) => (
                    <React.Fragment key={index}>
                        <View style={[
                            styles.stepIcon,
                            { backgroundColor: index <= currentStep ? colors.headerBackground : colors.muted + "20" }
                        ]}>
                            <Feather name={step.icon as any} size={16} color={index <= currentStep ? "#fff" : colors.mutedForeground} />
                        </View>
                        {index < STEPS.length - 1 && (
                            <View style={[
                                styles.stepLine,
                                { backgroundColor: index < currentStep ? colors.headerBackground : colors.muted + "20" }
                            ]} />
                        )}
                    </React.Fragment>
                ))}
            </View>

            <KeyboardAwareScrollViewCompat style={styles.content} showsVerticalScrollIndicator={false}>
                {renderStepContent()}
                <View style={{ height: 40 }} />
            </KeyboardAwareScrollViewCompat>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                {currentStep > 0 && (
                    <TouchableOpacity
                        style={[styles.backBtn, { borderColor: colors.border }]}
                        onPress={() => setCurrentStep(currentStep - 1)}
                    >
                        <Text style={[styles.backBtnText, { color: colors.foreground }]}>Back</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[
                        styles.nextBtn,
                        { backgroundColor: isNextDisabled() ? colors.muted + "40" : colors.buttonPrimary, flex: 1 }
                    ]}
                    onPress={handleNext}
                    disabled={isNextDisabled()}
                >
                    <Text style={[styles.nextBtnText, {
                        opacity: isNextDisabled() ? 0.7 : 1,
                        color: isNextDisabled() ? colors.mutedForeground : colors.onButtonPrimary,
                    }]}>
                        {currentStep === STEPS.length - 1 ? "Finish" : "Next Step"}
                    </Text>
                    <Feather name="arrow-right" size={18} color={isNextDisabled() ? colors.mutedForeground : colors.onButtonPrimary} style={{ marginLeft: 8, opacity: isNextDisabled() ? 0.5 : 1 }} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 16, marginBottom: 16 },
    headerTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
    headerSubtitle: { fontSize: 13, fontWeight: '500', marginTop: 2 },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    stepIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepLine: {
        flex: 1,
        height: 2,
        marginHorizontal: 6,
    },
    content: { flex: 1, paddingHorizontal: 16 },
    stepContainer: { flex: 1 },
    stepTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
    stepDesc: { fontSize: 13, lineHeight: 18, marginBottom: 6 },
    helperText: { fontSize: 11, fontStyle: 'italic', marginBottom: 10, opacity: 0.8 },
    usernameStatus: { fontSize: 12, marginBottom: 10, marginTop: -2 },
    textArea: {
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        textAlignVertical: 'top',
        borderWidth: 1,
    },
    input: {
        borderRadius: 10,
        padding: 10,
        fontSize: 14,
        borderWidth: 1,
        marginBottom: 10,
    },
    inputRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    addBtn: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    tagCloud: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 15,
    },
    tagText: { fontSize: 13, fontWeight: '600' },
    form: { gap: 2 },
    row: { flexDirection: 'row', gap: 8 },
    outlineBtn: {
        height: 42,
        borderRadius: 10,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    itemCard: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 10,
    },
    itemTitle: { fontSize: 14, fontWeight: '700' },
    itemSubtitle: { fontSize: 13, fontWeight: '500', marginTop: 2 },
    itemDate: { fontSize: 11, fontWeight: '400', marginTop: 2 },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 12,
        gap: 10,
    },
    backBtn: {
        height: 48,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backBtnText: { fontSize: 15, fontWeight: '600' },
    nextBtn: {
        height: 48,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextBtnText: { fontSize: 15, fontWeight: '700' },
    statusToggleRow: { flexDirection: 'row', gap: 8, marginVertical: 12 },
    statusToggleBtn: { 
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 6, 
        paddingVertical: 10, 
        borderRadius: 12, 
        borderWidth: 1 
    },
    statusToggleLabel: { fontSize: 12, fontWeight: '600' },
    divider: { height: 1, width: '100%', marginVertical: 10 },
});
