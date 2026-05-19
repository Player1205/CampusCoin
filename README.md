# 🎓 CampusCoin

![Status](https://img.shields.io/badge/Status-Active-brightgreen) ![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20PWA-blue) ![License](https://img.shields.io/badge/License-MIT-purple)

## 📋 Project Overview

CampusCoin is a university-exclusive, peer-to-peer task marketplace and social community. It is designed to empower students to monetize their skills and seamlessly get help with day-to-day campus needs—ranging from debugging code and tutoring to running local errands.

Instead of handling sensitive financial transactions directly on our servers, the platform leverages a secure **hybrid payment system**:

- 📱💸 **Fiat Settlements:** Real money is transferred safely between students using standard UPI deep-linking (PhonePe, GPay, Paytm).
- 🛡️🪙 **Utility Tokens:** A virtual token called **CampusCoins** is used to manage platform trust, prevent spam, and reward positive community engagement.

---

## 🔄 Core Workflow: The Task & Payment Loop

1. 📝 **Posting a Task**
   A student needs help (e.g., _"Fix my React bug for ₹100"_). They post this task to the campus marketplace.
2. 🤝 **Expressing Interest**
   Another student sees the task and clicks the **"100% Interested"** button. This immediately opens a secure, private chat room between the two peers.
3. 💬 **Negotiation**
   Inside the chat, the two students discuss the technical requirements, scope of work, and agree on a final price.
4. 💳 **Payment via UPI**
   Once the work is delivered, the task poster clicks a "Pay" button inside the chat. This generates a deep-link that automatically opens their preferred UPI app on their device, pre-filled with the exact agreed amount and the helper's secure UPI ID. The payment is settled safely outside the app, and a receipt is automatically logged in the chat.

---

## 🪙 The CampusCoin Economy (Tokenomics)

CampusCoins are **not** a 1:1 replacement for real money. They act as "trust tokens" that keep the platform ecosystem balanced, spam-free, and running smoothly.

### 📉 The Sink (How Students Spend Coins)

To maintain high quality, certain actions require burning coins:

- 📌 **Listing Fees:** It costs a small amount of coins to post a task. This prevents malicious users from spamming the feed with fake or low-effort requests.
- 🎯 **Application Fees:** It costs coins to click "100% Interested," stopping people from blindly applying to every single job on the board without intent to complete them.
- 🚀 **Visibility Boosts:** Students can spend a larger chunk of coins to "Boost" their task, pinning it to the top of the feed with a neon highlight so it gets noticed and completed faster.

### 📈 The Faucet (How Students Earn Coins)

Students are rewarded for contributing positively to the campus ecosystem:

- 🏆 **Good Citizen Bounties:** When a student successfully completes a task and the poster approves it, the platform automatically rewards the helper with fresh coins. _(**Anti-Cheat Note:** The coin reward for completing a task is mathematically lower than the fee required to post one, making it impossible for friends to "farm" fake tasks for infinite coins)._
- 🌟 **Community Karma:** Students earn coins when their posts on the "Flex" community feed (e.g., sharing study notes, offering a skill) receive likes and engagement from their peers.
- ✅ **Milestones & Streaks:** Students earn baseline coins for verifying their `.edu` university email, fully completing their profile, or simply maintaining a daily login streak.

---

_Built by students, for students._ 🚀
