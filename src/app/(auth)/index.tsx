import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { ThemedText as Text } from '@/components/ui/ThemedText';
import { Colors, Spacing } from '@/src/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    FadeInDown,
    FadeInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { validateAuth } from '@/src/lib/authSchema';
import { CustomAlert, useCustomAlert } from '@/components/ui/CustomAlert';

type FieldErrors = Record<string, string>;

export default function AuthScreen() {
    const { signIn, signUp } = useAuth();
    const alert = useCustomAlert();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);
    const [errors, setErrors] = useState<FieldErrors>({});

    const pulseScale = useSharedValue(1);

    useEffect(() => {
        pulseScale.value = withRepeat(
            withSequence(
                withTiming(1.03, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, [pulseScale]);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    // Clear errors when switching between login/register
    useEffect(() => {
        setErrors({});
    }, [isLogin]);

    // Clear specific field error when user types
    const handleFieldChange = (field: string, value: string, setter: (v: string) => void) => {
        setter(value);
        if (errors[field]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleSubmit = async () => {
        // Validate with Zod
        const result = validateAuth(
            { email, password, confirmPassword: isLogin ? password : confirmPassword },
            isLogin
        );

        if (!result.success) {
            setErrors(result.errors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const sanitizedEmail = result.data.email;
            const { error } = isLogin
                ? await signIn(sanitizedEmail, password)
                : await signUp(sanitizedEmail, password);

            if (error) {
                // Map Supabase errors to Portuguese
                let message = error.message;
                if (error.message.includes('Invalid login credentials')) {
                    message = 'Email ou senha incorretos';
                } else if (error.message.includes('User already registered')) {
                    message = 'Este email já está cadastrado';
                } else if (error.message.includes('Email not confirmed')) {
                    message = 'Confirme seu email antes de entrar';
                }
                alert.showError('Erro', message);
            } else if (!isLogin) {
                // Show success message for registration
                alert.showSuccess(
                    'Conta criada!',
                    'Verifique seu email para confirmar o cadastro antes de entrar.'
                );
                setIsLogin(true);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            }
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Algo deu errado';
            alert.showError('Erro', errorMessage);

        } finally {
            setIsLoading(false);
        }
    };

    const getInputStyle = (field: string) => [
        styles.inputContainer,
        focusedInput === field && styles.inputContainerFocused,
        errors[field] && styles.inputContainerError,
    ];


    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.content}
                >
                    {/* Hero Section */}
                    <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.header}>
                        <Animated.View style={[styles.logoContainer, pulseStyle]}>
                            <View style={styles.logoBg}>
                                <MaterialCommunityIcons name="lightning-bolt" size={36} color="#000" />
                            </View>
                        </Animated.View>

                        <Text style={styles.logo}>VIRTU</Text>
                        <Text style={styles.tagline}>EVOLUA. SUPERE. CONQUISTE.</Text>
                    </Animated.View>

                    {/* Form Section */}
                    <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.formContainer}>
                        <View style={styles.formHeader}>
                            <Text style={styles.formTitle}>
                                {isLogin ? 'Bem-vindo de volta' : 'Comece sua jornada'}
                            </Text>
                            <Text style={styles.formSubtitle}>
                                {isLogin ? 'Entre para continuar evoluindo' : 'Crie sua conta gratuita'}
                            </Text>
                        </View>

                        <View style={styles.form}>
                            {/* Email Input */}
                            <View>
                                <View style={getInputStyle('email')}>
                                    <MaterialCommunityIcons
                                        name="email-outline"
                                        size={20}
                                        color={errors.email ? '#EF4444' : focusedInput === 'email' ? Colors.primary : '#555'}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Seu email"
                                        placeholderTextColor="#555"
                                        value={email}
                                        onChangeText={(v) => handleFieldChange('email', v, setEmail)}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        onFocus={() => setFocusedInput('email')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                </View>
                                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                            </View>

                            {/* Password Input */}
                            <View>
                                <View style={getInputStyle('password')}>
                                    <MaterialCommunityIcons
                                        name="lock-outline"
                                        size={20}
                                        color={errors.password ? '#EF4444' : focusedInput === 'password' ? Colors.primary : '#555'}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Sua senha"
                                        placeholderTextColor="#555"
                                        value={password}
                                        onChangeText={(v) => handleFieldChange('password', v, setPassword)}
                                        secureTextEntry={!showPassword}
                                        onFocus={() => setFocusedInput('password')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <MaterialCommunityIcons
                                            name={showPassword ? 'eye-off' : 'eye'}
                                            size={20}
                                            color="#555"
                                        />
                                    </TouchableOpacity>
                                </View>
                                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                            </View>

                            {/* Confirm Password (Register only) */}
                            {!isLogin && (
                                <Animated.View entering={FadeInDown.springify()}>
                                    <View style={getInputStyle('confirmPassword')}>
                                        <MaterialCommunityIcons
                                            name="lock-check-outline"
                                            size={20}
                                            color={errors.confirmPassword ? '#EF4444' : focusedInput === 'confirm' ? Colors.primary : '#555'}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Confirmar senha"
                                            placeholderTextColor="#555"
                                            value={confirmPassword}
                                            onChangeText={(v) => handleFieldChange('confirmPassword', v, setConfirmPassword)}
                                            secureTextEntry={!showPassword}
                                            onFocus={() => setFocusedInput('confirm')}
                                            onBlur={() => setFocusedInput(null)}
                                        />
                                    </View>
                                    {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                                </Animated.View>
                            )}

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                                onPress={handleSubmit}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={[Colors.primary, '#E6C300']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.submitGradient}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#000" />
                                    ) : (
                                        <>
                                            <Text style={styles.submitButtonText}>
                                                {isLogin ? 'ENTRAR' : 'CRIAR CONTA'}
                                            </Text>
                                            <MaterialCommunityIcons name="arrow-right" size={22} color="#000" />
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>ou</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity
                            style={styles.toggleButton}
                            onPress={() => setIsLogin(!isLogin)}
                        >
                            <Text style={styles.toggleText}>
                                {isLogin ? 'Novo por aqui? ' : 'Já tem conta? '}
                                <Text style={styles.toggleTextBold}>
                                    {isLogin ? 'Criar conta' : 'Entrar'}
                                </Text>
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </KeyboardAvoidingView>
            </SafeAreaView>

            {/* Custom Alert */}
            <CustomAlert
                visible={alert.visible}
                title={alert.title}
                message={alert.message}
                type={alert.type}
                actions={alert.actions}
                onDismiss={alert.onDismiss}
            />
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.lg,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl * 1.5,
    },
    logoContainer: {
        marginBottom: Spacing.md,
    },
    logoBg: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
        elevation: 8,
    },
    logo: {
        fontSize: 36,
        fontFamily: 'Montserrat_900Black_Italic',
        color: '#fff',
        letterSpacing: 3,
    },
    tagline: {
        fontSize: 11,
        color: Colors.primary,
        letterSpacing: 2,
        marginTop: Spacing.xs,
        fontWeight: '600',
    },
    formContainer: {
        backgroundColor: '#141414',
        borderRadius: 20,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    formHeader: {
        marginBottom: Spacing.lg,
    },
    formTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    formSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    form: {
        gap: Spacing.md,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        height: 54,
        gap: Spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
    },
    inputContainerFocused: {
        borderColor: Colors.primary,
        backgroundColor: '#1E1A10',
    },
    inputContainerError: {
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#fff',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
        marginLeft: Spacing.sm,
    },
    submitButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: Spacing.sm,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitGradient: {
        height: 54,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    submitButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    dividerText: {
        color: '#444',
        marginHorizontal: Spacing.md,
        fontSize: 12,
    },
    toggleButton: {
        alignItems: 'center',
    },
    toggleText: {
        fontSize: 14,
        color: '#666',
    },
    toggleTextBold: {
        fontWeight: 'bold',
        color: Colors.primary,
    },
});


