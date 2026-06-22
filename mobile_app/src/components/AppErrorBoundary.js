import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default class AppErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('App recovered from render error:', error, info);
    }

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <View style={styles.container}>
                <Text style={styles.title}>Trills needs a quick refresh</Text>
                <Text style={styles.message}>
                    Something unexpected happened, but your app is still safe. Tap below to continue.
                </Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => this.setState({ hasError: false })}
                    activeOpacity={0.85}
                >
                    <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 28,
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 12,
    },
    message: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#4B184C',
        borderRadius: 14,
        paddingHorizontal: 28,
        paddingVertical: 14,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '800',
    },
});
