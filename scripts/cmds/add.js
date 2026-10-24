const fs = require("fs-extra");
const path = require("path");

const DATA_FILE = path.join(
	__dirname,
	"pendingData",
	"groups.json"
);

const SUPPORT_GC = "1496599381339519";
const BOT_NAME = "Lonely Bot";
const OWNER_NAME = "NZR";

function loadGroups() {
	try {
		return fs.readJsonSync(DATA_FILE);
	} catch {
		return [];
	}
}

function saveGroups(groups) {
	fs.ensureDirSync(path.dirname(DATA_FILE));
	fs.writeJsonSync(DATA_FILE, groups, { spaces: 2 });
}

module.exports = {
	config: {
		name: "add",
		version: "1.0.0",
		author: "lonely",
		countDown: 5,
		role: 2,
		shortDescription: {
			en: "Approve a pending group"
		},
		description: {
			en: "Approves a recorded pending group."
		},
		category: "owner"
	},

	onStart: async function ({ api, event, args }) {
		try {
			const choice = args[0];

			if (!choice) {
				return api.sendMessage(
					"Usage:\n" +
					"?pending\n" +
					"?add 1\n" +
					"?add GROUP_TID",
					event.threadID
				);
			}

			const groups = loadGroups();
			const pending = groups.filter(group =>
				group.status === "pending"
			);

			let selected;

			if (/^\d+$/.test(choice)) {
				selected = pending[Number(choice) - 1];

				// If no list index matches, try an exact TID.
				if (!selected) {
					selected = pending.find(group =>
						group.tid === String(choice)
					);
				}
			}

			if (!selected) {
				return api.sendMessage(
					"❌ Group not found in the recorded pending list.\n" +
					"Run ?pending first.",
					event.threadID
				);
			}

			if (selected.tid === SUPPORT_GC) {
				return api.sendMessage(
					"✅ This is the support GC. Approval is not required.",
					event.threadID
				);
			}

			return api.sendMessage(
				"⚠️ Group found, but this command does not yet have " +
				"your fork's verified invitation-approval API.\n\n" +
				`Group: ${selected.name}\n` +
				`TID: ${selected.tid}\n\n` +
				"Nothing has been approved. The approval API must be " +
				"connected before the bot can safely send its greeting " +
				"or change its nickname.",
				event.threadID
			);
		} catch (error) {
			console.error("add.js:", error);

			return api.sendMessage(
				`❌ Approval command error: ${error.message}`,
				event.threadID
			);
		}
	}
};