const axios = require('axios');
exports.config = {
	name: "tempmail",
	author: 'Zishin Sama',
	description: 'Get temporary email',
	category: 'tools',
	usage: ['/tempmail']
};

// Domains available for temp email
const domains = ["rteet.com", "1secmail.com", "1secmail.org", "1secmail.net", "wwjmp.com", "esiix.com", "xojxe.com", "yoggm.com"];

// Stores generated email addresses
let tempEmail = null;

exports.initialize = async (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	const { prompt, email } = req.query;

	// Handle /tempmail?prompt=gen to generate a temporary email
	if (prompt === 'gen') {
		const domain = domains[Math.floor(Math.random() * domains.length)];
		const username = Math.random().toString(36).slice(2, 10);
		tempEmail = `zsh${username}@${domain}`;

		return res.send(
			JSON.stringify({ message: `Temporary Email generated: ${tempEmail}` }, null, 2)
		);
	}

	// Handle /tempmail?prompt=inbox&email=<email> to check inbox
	if (prompt === 'inbox') {
		if (!email || !domains.some(d => email.endsWith(`@${d}`))) {
			return res.send(
				JSON.stringify({ error: 'Invalid or missing email. Please provide a valid temporary email.' }, null, 2)
			);
		}

		try {
			const [username, domain] = email.split('@');
			// Fetch inbox messages
			const inbox = (await axios.get(`https://www.1secmail.com/api/v1/?action=getMessages&login=${username}&domain=${domain}`)).data;

			if (!inbox.length) {
				return res.send(
					JSON.stringify({ message: 'Inbox is empty.' }, null, 2)
				);
			}

			// Get the latest email details
			const { id, from, subject, date } = inbox[0];
			const messageData = await axios.get(`https://www.1secmail.com/api/v1/?action=readMessage&login=${username}&domain=${domain}&id=${id}`);
			const { textBody } = messageData.data;

			return res.json({
				email: email,
				latestMessage: {
					from,
					subject,
					date,
					content: textBody
				}
			});
		} catch (error) {
			return res.send(
				JSON.stringify({ error: 'Error fetching inbox or email content.' }, null, 2)
			);
		}
	}

	// Handle invalid prompt values
	return res.send(
		JSON.stringify({ error: 'Invalid usage. Use prompt=gen or prompt=inbox with a valid email address.' }, null, 2)
	);
};