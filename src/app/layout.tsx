import '@/app/globals.css';

import {type Metadata, Viewport} from 'next';
import {Inter as FontSans, JetBrains_Mono as FontMono} from 'next/font/google';

import {ThemeProvider} from '@/providers/theme-provider';
import Script from 'next/script';
import {Toaster} from '@/components/ui/sonner';

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans'
});

const fontMono = FontMono({
	subsets: ['latin'],
	variable: '--font-mono'
});

export const viewport: Viewport = {
	initialScale: 1,
	width: 'device-width',
	maximumScale: 1,
	viewportFit: 'cover'
};

export const metadata: Metadata = {
	title: 'Saving calculator',
	description: 'A tool to help you manage your savings, needs, and wants.'
};

export default function RootLayout({
									   children
								   }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" suppressHydrationWarning>
		<body
			className={`${fontSans.variable} ${fontMono.variable} bg-background font-sans antialiased`}
		>
		<Script defer data-domain="investment.mariusbrt.com"
				src="https://plausible.mariusbrt.com/js/script.outbound-links.js"/>
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<main className={'max-w-5xl w-full mx-auto p-4 flex flex-col gap-4 lg:py-8'}>
				{children}
			</main>
			<Toaster position={'bottom-right'}/>
		</ThemeProvider>
		</body>
		</html>
	);
}
