export function Footer() {
	return <footer className={'flex justify-between max-w-5xl w-full px-4 mx-auto border-t py-8 max-lg:flex-col gap-4'}>
		<div className={'space-y-2'}>
			<p className={'text-muted-foreground'}>Made with ❤️ by <a href={'https://mariusbrt.com'}
																	  className={'underline font-semibold'}>
				Marius Brouty</a>
			</p>
			<p className={'text-xs text-muted-foreground'}>This tool is for information purposes only. It
				should
				not be considered as financial advice.</p>
		</div>
		<p className={'text-muted-foreground'}>Source code available on <a
			href={'https://github.com/Marius-brt/budget-flow'} target={'_blank'}
			className={'underline font-semibold'}>GitHub</a></p>
	</footer>;
}