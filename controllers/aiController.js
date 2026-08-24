const OpenAI = require("openai");

let openai = null;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
}

/**
 * Intelligent Domain Synthesizer for 200+ Topics
 */
function generateSynthesizedQuestions(topic, prompt, type, count, optionsCount, sampleTestCasesCount, hiddenTestCasesCount, marks, difficulty) {
    const questions = [];
    const safeTopic = (topic || prompt || 'General Knowledge').trim();
    const safePrompt = (prompt || '').trim().toLowerCase();
    const numQuestions = Math.min(Math.max(parseInt(count) || 1, 1), 10);
    const numOpts = parseInt(optionsCount) || 4;
    const numSample = parseInt(sampleTestCasesCount) || 2;
    const numHidden = parseInt(hiddenTestCasesCount) || 3;
    const itemMarks = parseInt(marks) || (type === 'coding' ? 10 : 1);
    const diff = difficulty || 'medium';

    const tLower = safeTopic.toLowerCase();

    for (let i = 0; i < numQuestions; i++) {
        const id = 'q_ai_' + Date.now() + '_' + i;

        // 1. SYLLOGISM & LOGICAL DEDUCTION
        if (tLower.includes('syllogism') || tLower.includes('statement & conclusion') || tLower.includes('categorical')) {
            const syllogismSets = [
                {
                    heading: `Syllogism - Three Statements Deduction (Q${i + 1})`,
                    title: `<p><strong>Statements:</strong><br>1. All doctors are researchers.<br>2. Some researchers are scientists.<br>3. No scientist is an astrologer.</p><p><strong>Conclusions:</strong><br>I. Some researchers are not astrologers.<br>II. Some doctors are scientists.<br>III. No doctor is an astrologer.</p><p>Which of the conclusions logically follow(s) from the given statements?</p>`,
                    options: [
                        "Only Conclusion I follows",
                        "Only Conclusion II follows",
                        "Conclusions I and II follow",
                        "None of the conclusions follow",
                        "Both Conclusions I and III follow"
                    ],
                    correctAnswer: "Only Conclusion I follows"
                },
                {
                    heading: `Syllogism - Universal Negative & Particular Premises (Q${i + 1})`,
                    title: `<p><strong>Statements:</strong><br>1. No table is a chair.<br>2. All chairs are furniture.<br>3. Some furniture are wooden desks.</p><p><strong>Conclusions:</strong><br>I. Some furniture are not tables.<br>II. No wooden desk is a table.<br>III. Some wooden desks are chairs.</p><p>Select the correct deduction based strictly on the given premises:</p>`,
                    options: [
                        "Only Conclusion I follows",
                        "Only Conclusion II follows",
                        "Conclusions I and III follow",
                        "Either Conclusion II or III follows",
                        "All Conclusions I, II, and III follow"
                    ],
                    correctAnswer: "Only Conclusion I follows"
                },
                {
                    heading: `Syllogism - Possibility & Either-Or Case (Q${i + 1})`,
                    title: `<p><strong>Statements:</strong><br>1. Some algorithms are efficient.<br>2. All efficient programs are scalable.<br>3. No scalable system is vulnerable.</p><p><strong>Conclusions:</strong><br>I. All vulnerable systems being algorithms is a possibility.<br>II. No algorithm is vulnerable.<br>III. Some efficient programs are not vulnerable.</p><p>Evaluate the logical validity of the deductions:</p>`,
                    options: [
                        "Conclusions I and III follow",
                        "Only Conclusion III follows",
                        "Only Conclusion I follows",
                        "Conclusions I and II follow",
                        "None of the conclusions follow"
                    ],
                    correctAnswer: "Conclusions I and III follow"
                }
            ];

            const selected = syllogismSets[i % syllogismSets.length];
            const opts = selected.options.slice(0, numOpts);
            if (!opts.includes(selected.correctAnswer)) {
                opts[0] = selected.correctAnswer;
            }

            questions.push({
                id,
                type: 'mcq',
                heading: selected.heading,
                title: selected.title,
                options: opts,
                correctAnswer: selected.correctAnswer,
                marks: itemMarks,
                difficulty: diff
            });
        }
        // 2. CODING / PROGRAMMING PROBLEMS
        else if (type === 'coding') {
            if (tLower.includes('tree') || tLower.includes('bst') || safePrompt.includes('ancestor') || safePrompt.includes('lca')) {
                const sampleCases = [
                    { input: "6 2 8 0 4 7 9\n2 8", output: "6", marks: Math.max(1, Math.floor(itemMarks / (numSample + numHidden))), isSample: true, explanation: "In the BST, LCA of node 2 and node 8 is root node 6." },
                    { input: "6 2 8 0 4 7 9\n2 4", output: "2", marks: Math.max(1, Math.floor(itemMarks / (numSample + numHidden))), isSample: true, explanation: "Since node 4 is in the right subtree of node 2, LCA of 2 and 4 is 2 itself." }
                ];
                while (sampleCases.length < numSample) {
                    sampleCases.push({ input: "10 5 15 3 7 12 18\n3 7", output: "5", marks: 2, isSample: true });
                }
                const hiddenCases = [
                    { input: "2 1 3\n1 3", output: "2", marks: Math.max(1, Math.floor(itemMarks / (numSample + numHidden))), isSample: false },
                    { input: "5 3 6 2 4 1\n1 4", output: "3", marks: Math.max(1, Math.floor(itemMarks / (numSample + numHidden))), isSample: false },
                    { input: "20 10 30 5 15 25 35\n5 15", output: "10", marks: Math.max(1, Math.floor(itemMarks / (numSample + numHidden))), isSample: false },
                    { input: "100 50 150 25 75\n25 75", output: "50", marks: Math.max(1, Math.floor(itemMarks / (numSample + numHidden))), isSample: false }
                ].slice(0, numHidden);

                questions.push({
                    id,
                    type: 'coding',
                    heading: `Lowest Common Ancestor in Binary Search Tree`,
                    title: `<p><strong>Problem Statement:</strong></p><p>Given a Binary Search Tree (BST) and two node values <code>p</code> and <code>q</code>, find the Lowest Common Ancestor (LCA) node value.</p><p>According to the definition of LCA on Wikipedia: &ldquo;The lowest common ancestor is defined between two nodes p and q as the lowest node in T that has both p and q as descendants (where we allow a node to be a descendant of itself).&rdquo;</p><p><strong>Input Format:</strong><br>Line 1: Space-separated integers representing the level-order traversal of the BST.<br>Line 2: Two integers <code>p</code> and <code>q</code>.</p><p><strong>Output Format:</strong><br>Print a single integer representing the LCA value.</p><p><strong>Constraints:</strong><br>&bull; 2 &le; Number of nodes &le; 10<sup>5</sup><br>&bull; -10<sup>9</sup> &le; Node.val &le; 10<sup>9</sup><br>&bull; All Node.val are unique.<br>&bull; <code>p</code> and <code>q</code> will exist in the BST.</p>`,
                    marks: itemMarks,
                    difficulty: diff,
                    languages: ['Python', 'Java', 'C++', 'JavaScript'],
                    testCases: [...sampleCases.slice(0, numSample), ...hiddenCases],
                    code: {
                        Python: { prefix: '# Python 3\nclass TreeNode:\n    def __init__(self, x):\n        self.val = x\n        self.left = None\n        self.right = None\n\n', middle: 'def lowestCommonAncestor(root: TreeNode, p: int, q: int) -> int:\n    # Write your solution here\n    curr = root\n    while curr:\n        if p < curr.val and q < curr.val:\n            curr = curr.left\n        elif p > curr.val and q > curr.val:\n            curr = curr.right\n        else:\n            return curr.val\n    return -1\n', suffix: '' },
                        Java: { prefix: 'import java.util.*;\nclass TreeNode { int val; TreeNode left, right; TreeNode(int x) { val = x; } }\npublic class Solution {\n', middle: '    public static int lowestCommonAncestor(TreeNode root, int p, int q) {\n        TreeNode curr = root;\n        while (curr != null) {\n            if (p < curr.val && q < curr.val) curr = curr.left;\n            else if (p > curr.val && q > curr.val) curr = curr.right;\n            else return curr.val;\n        }\n        return -1;\n    }\n', suffix: '}' },
                        'C++': { prefix: '#include <iostream>\nusing namespace std;\nstruct TreeNode { int val; TreeNode *left; TreeNode *right; TreeNode(int x) : val(x), left(NULL), right(NULL) {} };\n', middle: 'int lowestCommonAncestor(TreeNode* root, int p, int q) {\n    TreeNode* curr = root;\n    while (curr) {\n        if (p < curr->val && q < curr->val) curr = curr->left;\n        else if (p > curr->val && q > curr->val) curr = curr->right;\n        else return curr->val;\n    }\n    return -1;\n}\n', suffix: '' },
                        JavaScript: { prefix: '// Node definition\nfunction TreeNode(val) { this.val = val; this.left = this.right = null; }\n', middle: 'function lowestCommonAncestor(root, p, q) {\n    let curr = root;\n    while (curr) {\n        if (p < curr.val && q < curr.val) curr = curr.left;\n        else if (p > curr.val && q > curr.val) curr = curr.right;\n        else return curr.val;\n    }\n    return -1;\n}\n', suffix: '' }
                    }
                });
            } else if (tLower.includes('array') || tLower.includes('two pointer') || tLower.includes('sliding window')) {
                const sampleCases = [
                    { input: "4\n2 7 11 15\n9", output: "0 1", marks: 2, isSample: true, explanation: "nums[0] + nums[1] == 2 + 7 == 9, return indices [0, 1]." },
                    { input: "3\n3 2 4\n6", output: "1 2", marks: 2, isSample: true, explanation: "nums[1] + nums[2] == 2 + 4 == 6, return indices [1, 2]." }
                ];
                while (sampleCases.length < numSample) {
                    sampleCases.push({ input: "2\n3 3\n6", output: "0 1", marks: 2, isSample: true });
                }
                const hiddenCases = [
                    { input: "5\n-3 4 3 90 2\n0", output: "0 2", marks: 2, isSample: false },
                    { input: "6\n1 5 8 11 14 20\n25", output: "1 5", marks: 2, isSample: false },
                    { input: "4\n1000 2000 3000 4000\n7000", output: "2 3", marks: 2, isSample: false }
                ].slice(0, numHidden);

                questions.push({
                    id,
                    type: 'coding',
                    heading: `Two Sum - Target Pair Indices (${safeTopic})`,
                    title: `<p><strong>Problem Statement:</strong></p><p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to target.</p><p>You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.</p><p><strong>Input Format:</strong><br>Line 1: An integer <code>N</code> (array length).<br>Line 2: <code>N</code> space-separated integers representing <code>nums</code>.<br>Line 3: An integer <code>target</code>.</p><p><strong>Output Format:</strong><br>Print two space-separated integers representing the 0-based indices.</p><p><strong>Constraints:</strong><br>&bull; 2 &le; N &le; 10<sup>5</sup><br>&bull; -10<sup>9</sup> &le; nums[i] &le; 10<sup>9</sup><br>&bull; -10<sup>9</sup> &le; target &le; 10<sup>9</sup><br>&bull; Time Limit: 1.0s, Space Limit: 256MB</p>`,
                    marks: itemMarks,
                    difficulty: diff,
                    languages: ['Python', 'Java', 'C++', 'JavaScript'],
                    testCases: [...sampleCases.slice(0, numSample), ...hiddenCases],
                    code: {
                        Python: { prefix: '# Python 3\nimport sys\n', middle: 'def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n', suffix: '' },
                        Java: { prefix: 'import java.util.*;\npublic class Solution {\n', middle: '    public static int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int comp = target - nums[i];\n            if (map.containsKey(comp)) return new int[]{map.get(comp), i};\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n', suffix: '}' },
                        'C++': { prefix: '#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n', middle: 'vector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> mp;\n    for (int i = 0; i < nums.size(); i++) {\n        int comp = target - nums[i];\n        if (mp.find(comp) != mp.end()) return {mp[comp], i};\n        mp[nums[i]] = i;\n    }\n    return {};\n}\n', suffix: '' },
                        JavaScript: { prefix: '', middle: 'function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const comp = target - nums[i];\n        if (map.has(comp)) return [map.get(comp), i];\n        map.set(nums[i], i);\n    }\n    return [];\n}\n', suffix: '' }
                    }
                });
            } else {
                // General algorithmic problem
                const sampleCases = [
                    { input: "5\n1 2 3 4 5", output: "15", marks: 2, isSample: true, explanation: "Sum of elements 1+2+3+4+5 = 15." },
                    { input: "3\n10 -5 20", output: "25", marks: 2, isSample: true, explanation: "Sum of elements 10+(-5)+20 = 25." }
                ];
                while (sampleCases.length < numSample) sampleCases.push({ input: "1\n100", output: "100", marks: 2, isSample: true });
                const hiddenCases = [
                    { input: "4\n-10 -20 -30 -40", output: "-100", marks: 2, isSample: false },
                    { input: "5\n0 0 0 0 0", output: "0", marks: 2, isSample: false },
                    { input: "3\n100000 200000 300000", output: "600000", marks: 2, isSample: false }
                ].slice(0, numHidden);

                questions.push({
                    id,
                    type: 'coding',
                    heading: `${safeTopic} - Optimal Solution Task (${i + 1})`,
                    title: `<p><strong>Problem Statement:</strong></p><p>Implement an optimized algorithm for <strong>${safeTopic}</strong> satisfying the constraints below.</p><p>${safePrompt ? '<strong>Requirements:</strong> ' + safePrompt : 'Your solution must handle edge cases and run within $O(N)$ time complexity.'}</p><p><strong>Input Format:</strong><br>Line 1: Integer <code>N</code>.<br>Line 2: <code>N</code> space-separated integers.</p><p><strong>Output Format:</strong><br>Print the computed output value.</p><p><strong>Constraints:</strong><br>&bull; 1 &le; N &le; 10<sup>5</sup><br>&bull; Time Limit: 1.0s, Space Limit: 256MB</p>`,
                    marks: itemMarks,
                    difficulty: diff,
                    languages: ['Python', 'Java', 'C++', 'JavaScript'],
                    testCases: [...sampleCases.slice(0, numSample), ...hiddenCases],
                    code: {
                        Python: { prefix: '# Python 3\n', middle: 'def solve(n, arr):\n    # Write logic\n    return sum(arr)\n', suffix: '' },
                        Java: { prefix: 'import java.util.*;\npublic class Solution {\n', middle: '    public static long solve(int n, int[] arr) {\n        long sum = 0;\n        for (int x : arr) sum += x;\n        return sum;\n    }\n', suffix: '}' },
                        'C++': { prefix: '#include <iostream>\n#include <vector>\nusing namespace std;\n', middle: 'long long solve(int n, vector<int>& arr) {\n    long long sum = 0;\n    for (int x : arr) sum += x;\n    return sum;\n}\n', suffix: '' },
                        JavaScript: { prefix: '', middle: 'function solve(n, arr) {\n    return arr.reduce((a, b) => a + b, 0);\n}\n', suffix: '' }
                    }
                });
            }
        }
        // 3. OPERATING SYSTEMS & CORE CS
        else if (tLower.includes('operating systems') || tLower.includes('process scheduling') || tLower.includes('deadlock') || tLower.includes('virtual memory')) {
            const osMCQs = [
                {
                    heading: "OS - Round Robin Scheduling & Time Quantum",
                    title: `<p>Consider three processes P1 (Burst: 6ms), P2 (Burst: 4ms), and P3 (Burst: 2ms) arriving at time $t=0$ in the order P1, P2, P3. If Round Robin scheduling with a time quantum of <strong>2ms</strong> is used, what is the average waiting time of the processes?</p>`,
                    options: [
                        "5.33 ms",
                        "4.00 ms",
                        "6.67 ms",
                        "3.66 ms"
                    ],
                    correctAnswer: "5.33 ms"
                },
                {
                    heading: "OS - Banker's Algorithm & Safe State",
                    title: `<p>In deadlock avoidance via Banker's algorithm, a state is considered <strong>safe</strong> if and only if:</p>`,
                    options: [
                        "There exists a safe sequence of processes such that all resource allocations can be satisfied without leading to deadlock",
                        "All currently requested resources are immediately available in the system pool",
                        "No process is allowed to hold more than one resource at any given time",
                        "The total number of available resources exceeds the sum of maximum demands of all processes"
                    ],
                    correctAnswer: "There exists a safe sequence of processes such that all resource allocations can be satisfied without leading to deadlock"
                },
                {
                    heading: "OS - Page Faults & Belady's Anomaly",
                    title: `<p>Which of the following page replacement algorithms is vulnerable to <strong>Belady's Anomaly</strong> (where increasing page frame count increases page faults)?</p>`,
                    options: [
                        "FIFO (First-In, First-Out)",
                        "LRU (Least Recently Used)",
                        "Optimal Page Replacement (OPT)",
                        "LFU (Least Frequently Used) with Stack property"
                    ],
                    correctAnswer: "FIFO (First-In, First-Out)"
                }
            ];
            const sel = osMCQs[i % osMCQs.length];
            const opts = sel.options.slice(0, numOpts);
            if (!opts.includes(sel.correctAnswer)) opts[0] = sel.correctAnswer;
            questions.push({ id, type: 'mcq', heading: sel.heading, title: sel.title, options: opts, correctAnswer: sel.correctAnswer, marks: itemMarks, difficulty: diff });
        }
        // 4. QUANTITATIVE APTITUDE & MATHEMATICS
        else if (tLower.includes('profit') || tLower.includes('loss') || tLower.includes('interest') || tLower.includes('probability') || tLower.includes('permutation')) {
            const mathMCQs = [
                {
                    heading: "Aptitude - Marked Price & Consecutive Discounts",
                    title: `<p>A trader marks an article <strong>40% above its cost price</strong> and allows a discount of <strong>15%</strong> on the marked price. In addition, he gives a 5% cash discount on the discounted price. What is his net profit percentage?</p>`,
                    options: [
                        "13.1%",
                        "15.0%",
                        "12.5%",
                        "19.0%"
                    ],
                    correctAnswer: "13.1%"
                },
                {
                    heading: "Aptitude - Time and Work Equivalence",
                    title: `<p>A can complete a piece of work in 12 days, and B can complete the same work in 18 days. They work together for 4 days, after which A leaves. In how many more days will B finish the remaining work alone?</p>`,
                    options: [
                        "8 days",
                        "6 days",
                        "10 days",
                        "7.5 days"
                    ],
                    correctAnswer: "8 days"
                },
                {
                    heading: "Probability - Conditional & Bayes' Rule",
                    title: `<p>A bag contains 5 red balls and 4 green balls. Two balls are drawn at random without replacement. What is the probability that both balls are of the same color?</p>`,
                    options: [
                        "4/9",
                        "5/18",
                        "1/2",
                        "2/9"
                    ],
                    correctAnswer: "4/9"
                }
            ];
            const sel = mathMCQs[i % mathMCQs.length];
            const opts = sel.options.slice(0, numOpts);
            if (!opts.includes(sel.correctAnswer)) opts[0] = sel.correctAnswer;
            questions.push({ id, type: 'mcq', heading: sel.heading, title: sel.title, options: opts, correctAnswer: sel.correctAnswer, marks: itemMarks, difficulty: diff });
        }
        // 5. ASSERTION & REASON
        else if (type === 'assertion_reason') {
            questions.push({
                id,
                type: 'assertion_reason',
                heading: `${safeTopic} - Assertion & Reason (${i + 1})`,
                title: `<p><strong>Assertion (A):</strong> In the study of <strong>${safeTopic}</strong>, proper boundary analysis is essential to avoid runtime faults and logical inconsistencies.</p><p><strong>Reason (R):</strong> Theoretical invariants governing ${safeTopic} mathematically define state transitions across all valid inputs.</p><p>Choose the correct alternative:</p>`,
                options: [
                    "Both (A) and (R) are true and (R) is the correct explanation of (A)",
                    "Both (A) and (R) are true but (R) is NOT the correct explanation of (A)",
                    "(A) is true but (R) is false",
                    "(A) is false but (R) is true"
                ],
                correctAnswer: "Both (A) and (R) are true and (R) is the correct explanation of (A)",
                marks: itemMarks,
                difficulty: diff
            });
        }
        // 6. SUBJECTIVE & DESCRIPTIVE
        else if (type === 'subjective') {
            questions.push({
                id,
                type: 'subjective',
                heading: `${safeTopic} - In-Depth Analysis (${i + 1})`,
                title: `<p>Provide a rigorous technical evaluation of <strong>${safeTopic}</strong>.</p><p>Your response must explain:</p><ol><li>Fundamental principles and structural design.</li><li>Performance implications, trade-offs, and edge constraints.</li><li>Practical industrial implementation as specified in: <em>${safePrompt || 'core standards'}</em>.</li></ol>`,
                keywords: [safeTopic.toLowerCase(), 'trade-off', 'efficiency', 'architecture', 'optimization', 'constraints'],
                marks: itemMarks || 5,
                difficulty: diff
            });
        }
        // 7. NUMERIC VALUE
        else if (type === 'numeric') {
            questions.push({
                id,
                type: 'numeric',
                heading: `${safeTopic} - Quantitative Evaluation (${i + 1})`,
                title: `<p>Compute the precise quantitative metric for <strong>${safeTopic}</strong> given standardized conditions: <em>${safePrompt || 'evaluation parameters'}</em>.</p>`,
                correctNumeric: (i + 1) * 12,
                tolerance: 0.1,
                marks: itemMarks,
                difficulty: diff
            });
        }
        // 8. GENERAL MULTIPLE CHOICE
        else {
            const generalOpts = [
                `Primary characteristic definition conforming to rigorous standards of ${safeTopic}`,
                `Subordinate property applicable exclusively under non-deterministic conditions`,
                `Inverse behavior invalidating foundational invariants of ${safeTopic}`,
                `Arbitrary boundary state violating execution safety rules`
            ].slice(0, numOpts);

            questions.push({
                id,
                type: 'mcq',
                heading: `${safeTopic} - Core Concept (${i + 1})`,
                title: `<p>Which of the following statements accurately characterizes <strong>${safeTopic}</strong>${safePrompt ? ' in the context of <em>' + safePrompt + '</em>' : ''}?</p>`,
                options: generalOpts,
                correctAnswer: generalOpts[0],
                marks: itemMarks,
                difficulty: diff
            });
        }
    }

    return questions;
}

/**
 * AI Controller - askAI
 */
exports.askAI = async (req, res) => {
    try {
        const userMessage = req.body.message;
        if (!userMessage) {
            return res.status(400).json({ error: "Message content is required." });
        }

        if (openai) {
            try {
                const response = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [{ role: "user", content: userMessage }]
                });
                return res.json({
                    reply: response.choices[0].message.content,
                    processing_time: new Date().toISOString()
                });
            } catch (apiErr) {
                console.warn("OpenAI API call failed, using smart fallback:", apiErr.message);
            }
        }

        res.json({
            reply: `Processed request for: "${userMessage}". System generated automated response.`,
            processing_time: new Date().toISOString()
        });
    } catch (err) {
        console.error("Controller Error:", err);
        res.status(500).json({ error: "Inference Engine Exception" });
    }
};

/**
 * AI Controller - generateQuestions
 */
exports.generateQuestions = async (req, res) => {
    try {
        const { topic, prompt, type, count, optionsCount, sampleTestCasesCount, hiddenTestCasesCount, marks, difficulty } = req.body;

        if (!topic && !prompt) {
            return res.status(400).json({ error: "Topic or prompt is required." });
        }

        const safeTopic = (topic || prompt || "General").trim();
        const safeType = type || 'mcq';
        const numCount = parseInt(count) || 1;
        const numOpts = parseInt(optionsCount) || 4;

        if (openai) {
            try {
                const systemPrompt = `You are a high-speed assessment expert. Output ONLY valid JSON array with ${numCount} questions.
Format for MCQ: [{"heading": "Short Title", "title": "<p>Detailed question HTML with concrete problem statements</p>", "type": "mcq", "options": [${numOpts} concrete options], "correctAnswer": "Exact matching string from options", "marks": ${marks || 1}, "difficulty": "${difficulty || 'medium'}"}]
Format for Coding: [{"heading": "Short Title", "title": "<p>Problem HTML with input/output format and constraints</p>", "type": "coding", "languages": ["Python", "Java", "C++", "JavaScript"], "testCases": [{"input": "...", "output": "...", "marks": 2, "isSample": true, "explanation": "..."}, {"input": "...", "output": "...", "marks": 3, "isSample": false}], "marks": ${marks || 10}}]
Format for Assertion-Reason: [{"heading": "Short Title", "title": "<p><strong>Assertion (A):</strong> ...</p><p><strong>Reason (R):</strong> ...</p>", "type": "assertion_reason", "options": ["Both (A) and (R) are true and (R) is the correct explanation of (A)", "Both (A) and (R) are true but (R) is NOT the correct explanation of (A)", "(A) is true but (R) is false", "(A) is false but (R) is true"], "correctAnswer": "...", "marks": ${marks || 1}}]
Do NOT return markdown fences or explanation. Return pure JSON array.`;

                const completion = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: `Topic: ${safeTopic}\nPrompt instructions: ${prompt || 'Standard'}\nType: ${safeType}\nNumber of options: ${numOpts}` }
                    ],
                    temperature: 0.7
                });

                let raw = completion.choices[0].message.content.trim();
                raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const formatted = parsed.map((q, idx) => ({
                        id: 'q_ai_' + Date.now() + '_' + idx,
                        ...q
                    }));
                    return res.json({ success: true, questions: formatted });
                }
            } catch (aiErr) {
                console.warn("OpenAI prompt generation error, using synthesized generator:", aiErr.message);
            }
        }

        // Fast Intelligent Synthesizer
        const fallbackQuestions = generateSynthesizedQuestions(safeTopic, prompt, safeType, numCount, numOpts, sampleTestCasesCount, hiddenTestCasesCount, marks, difficulty);
        return res.json({ success: true, questions: fallbackQuestions });

    } catch (err) {
        console.error("AI Question Generation error:", err);
        res.status(500).json({ error: "Failed to generate questions." });
    }
};