<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const { loggedIn, fetch: refreshSession } = useUserSession()
if (loggedIn.value) {
    navigateTo('/')
}
const credentials = reactive({
    email: '',
    password: '',
})

async function login() {
    try {
        await $fetch('/api/login', {
            method: 'POST',
            body: credentials,
        })
        await refreshSession()
        await navigateTo('/')
    } catch {
        alert('Bad credentials')
    }
}
</script>

<template>
    <div class="flex min-h-screen items-center justify-center p-4">
        <form @submit.prevent="login">
            <Card class="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                    <CardAction>
                        <ThemeToggle />
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <div class="grid w-full items-center gap-4">
                        <div class="flex flex-col space-y-1.5">
                            <Label for="email">Email</Label>
                            <Input id="email" type="email" placeholder="m@example.com" v-model="credentials.email" />
                        </div>
                        <div class="flex flex-col space-y-1.5">
                            <div class="flex items-center">
                                <Label for="password">Password</Label>
                            </div>
                            <Input id="password" type="password" v-model="credentials.password" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter class="flex flex-col gap-2">
                    <Button type="submit" class="w-full">
                        Login
                    </Button>
                </CardFooter>
            </Card>
        </form>

    </div>
</template>
