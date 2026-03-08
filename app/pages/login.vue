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

const { loggedIn, user, fetch: refreshSession } = useUserSession()
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

        // Refresh the session on client-side and redirect to the home page
        await refreshSession()
        await navigateTo('/')
    } catch {
        alert('Bad credentials')
    }
}
</script>

<template>
    <div class="flex min-h-screen items-center justify-center p-4">
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
                <form>
                    <div class="grid w-full items-center gap-4">
                        <div class="flex flex-col space-y-1.5">
                            <Label for="email">Email</Label>
                            <Input id="email" type="email" placeholder="m@example.com" />
                        </div>
                        <div class="flex flex-col space-y-1.5">
                            <div class="flex items-center">
                                <Label for="password">Password</Label>
                            </div>
                            <Input id="password" type="password" />
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter class="flex flex-col gap-2">
                <Button class="w-full">
                    Login
                </Button>
            </CardFooter>
        </Card>
    </div>
</template>
