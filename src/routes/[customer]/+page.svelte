<script>
	import App from '$lib/App.svelte';
	import BoardLayout from '$lib/layouts/BoardLayout.svelte';
	import { page } from '$app/stores';
	
	const customerId = $derived($page.params.customer);
</script>

<App><BoardLayout customerRoute={customerId} /></App>
