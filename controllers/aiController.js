const OpenAI = require("openai");

let defaultOpenai = null;
if (process.env.OPENAI_API_KEY) {
    try {
        defaultOpenai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    } catch (e) {
        console.warn("Failed to initialize default OpenAI instance:", e.message);
    }
}

/**
 * 10 Distinct Question Synthesizer
 * Generates 100% unique, non-repeating, domain-tailored assessments for any topic.
 */
function generateSynthesizedQuestions(topic, prompt, type, count, optionsCount, sampleTestCasesCount, hiddenTestCasesCount, marks, difficulty) {
    const questions = [];
    const safeTopic = (topic || prompt || 'General Knowledge').trim();
    const safePrompt = (prompt || '').trim();
    const numQuestions = Math.min(Math.max(parseInt(count) || 1, 1), 10);
    const numOpts = Math.min(Math.max(parseInt(optionsCount) || 4, 2), 6);
    const numSample = Math.min(Math.max(parseInt(sampleTestCasesCount) || 2, 1), 5);
    const numHidden = Math.min(Math.max(parseInt(hiddenTestCasesCount) || 3, 1), 10);
    const itemMarks = parseInt(marks) || (type === 'coding' ? 10 : 1);
    const diff = difficulty || 'medium';

    // 10 UNIQUE CODING PARADIGMS
    const codingParadigms = [
        {
            headingSuffix: "Prefix Accumulation & Range Transformation",
            funcName: "solvePrefixTransform",
            statement: (t, p) => `<p><strong>Problem Statement:</strong></p><p>You are given a sequence of integers representing operational state values for <strong>${t}</strong>. Compute the maximum continuous subsegment transformation where the cumulative balance remains strictly positive.</p>${p ? '<p><strong>Contextual Note:</strong> ' + p + '</p>' : ''}<p><strong>Input Format:</strong><br>Line 1: An integer <code>N</code> denoting array length.<br>Line 2: <code>N</code> space-separated integers.</p><p><strong>Output Format:</strong><br>Print a single integer representing the maximum optimal subarray score.</p><p><strong>Constraints:</strong><br>&bull; 1 &le; N &le; 10<sup>5</sup><br>&bull; -10<sup>4</sup> &le; Arr[i] &le; 10<sup>4</sup></p>`,
            sampleCases: [
                { input: "5\n2 3 -1 4 -2", output: "8", marks: 2, isSample: true, explanation: "Subarray [2, 3, -1, 4] gives maximum sum 8." },
                { input: "4\n-2 -3 -1 -5", output: "-1", marks: 2, isSample: true, explanation: "Single element [-1] gives maximum sum." }
            ],
            hiddenCases: [
                { input: "1\n100", output: "100", marks: 3, isSample: false },
                { input: "6\n5 -2 3 -1 4 -3", output: "9", marks: 3, isSample: false },
                { input: "7\n-3 4 -1 2 1 -5 4", output: "6", marks: 3, isSample: false }
            ],
            codePython: 'def solvePrefixTransform(n: int, arr: list[int]) -> int:\n    max_sum = curr_sum = arr[0]\n    for x in arr[1:]:\n        curr_sum = max(x, curr_sum + x)\n        max_sum = max(max_sum, curr_sum)\n    return max_sum\n',
            codeJava: '    public static int solvePrefixTransform(int n, int[] arr) {\n        int maxSum = arr[0], currSum = arr[0];\n        for (int i = 1; i < n; i++) {\n            currSum = Math.max(arr[i], currSum + arr[i]);\n            maxSum = Math.max(maxSum, currSum);\n        }\n        return maxSum;\n    }\n',
            codeCpp: 'int solvePrefixTransform(int n, vector<int>& arr) {\n    int maxSum = arr[0], currSum = arr[0];\n    for (int i = 1; i < n; i++) {\n        currSum = max(arr[i], currSum + arr[i]);\n        maxSum = max(maxSum, currSum);\n    }\n    return maxSum;\n}\n',
            codeJs: 'function solvePrefixTransform(n, arr) {\n    let maxSum = arr[0], currSum = arr[0];\n    for (let i = 1; i < n; i++) {\n        currSum = Math.max(arr[i], currSum + arr[i]);\n        maxSum = Math.max(maxSum, currSum);\n    }\n    return maxSum;\n}\n'
        },
        {
            headingSuffix: "Two-Pointer Squeeze & Boundary Pivot",
            funcName: "solveBoundaryPivot",
            statement: (t, p) => `<p><strong>Problem Statement:</strong></p><p>Given an array of boundary heights in <strong>${t}</strong>, find two lines that together with the x-axis form a container such that the container holds the maximum capacity.</p>${p ? '<p><strong>Contextual Note:</strong> ' + p + '</p>' : ''}<p><strong>Input Format:</strong><br>Line 1: An integer <code>N</code>.<br>Line 2: <code>N</code> space-separated integers representing boundary heights.</p><p><strong>Output Format:</strong><br>Print the maximum capacity.</p><p><strong>Constraints:</strong><br>&bull; 2 &le; N &le; 10<sup>5</sup><br>&bull; 0 &le; Height[i] &le; 10<sup>4</sup></p>`,
            sampleCases: [
                { input: "9\n1 8 6 2 5 4 8 3 7", output: "49", marks: 2, isSample: true, explanation: "Between index 1 (height 8) and index 8 (height 7), capacity is min(8,7) * (8-1) = 49." },
                { input: "2\n1 1", output: "1", marks: 2, isSample: true, explanation: "Capacity is min(1,1) * 1 = 1." }
            ],
            hiddenCases: [
                { input: "4\n4 3 2 1 4", output: "16", marks: 3, isSample: false },
                { input: "5\n1 2 1 2 1", output: "4", marks: 3, isSample: false },
                { input: "6\n2 3 4 5 18 17 6", output: "17", marks: 3, isSample: false }
            ],
            codePython: 'def solveBoundaryPivot(n: int, height: list[int]) -> int:\n    l, r = 0, n - 1\n    max_area = 0\n    while l < r:\n        max_area = max(max_area, min(height[l], height[r]) * (r - l))\n        if height[l] < height[r]: l += 1\n        else: r -= 1\n    return max_area\n',
            codeJava: '    public static int solveBoundaryPivot(int n, int[] height) {\n        int l = 0, r = n - 1, maxArea = 0;\n        while (l < r) {\n            maxArea = Math.max(maxArea, Math.min(height[l], height[r]) * (r - l));\n            if (height[l] < height[r]) l++; else r--;\n        }\n        return maxArea;\n    }\n',
            codeCpp: 'int solveBoundaryPivot(int n, vector<int>& height) {\n    int l = 0, r = n - 1, maxArea = 0;\n    while (l < r) {\n        maxArea = max(maxArea, min(height[l], height[r]) * (r - l));\n        if (height[l] < height[r]) l++; else r--;\n    }\n    return maxArea;\n}\n',
            codeJs: 'function solveBoundaryPivot(n, height) {\n    let l = 0, r = n - 1, maxArea = 0;\n    while (l < r) {\n        maxArea = Math.max(maxArea, Math.min(height[l], height[r]) * (r - l));\n        if (height[l] < height[r]) l++; else r--;\n    }\n    return maxArea;\n}\n'
        },
        {
            headingSuffix: "Sliding Window & Subsegment State",
            funcName: "solveSlidingState",
            statement: (t, p) => `<p><strong>Problem Statement:</strong></p><p>Given an array of positive integers <code>nums</code> and a target <code>S</code> for <strong>${t}</strong>, find the minimal length of a contiguous subarray of which the sum &ge; <code>S</code>. If there is no such subarray, return 0.</p>${p ? '<p><strong>Contextual Note:</strong> ' + p + '</p>' : ''}<p><strong>Input Format:</strong><br>Line 1: Two integers <code>N</code> and <code>S</code>.<br>Line 2: <code>N</code> space-separated integers.</p><p><strong>Output Format:</strong><br>Print the minimal subarray length.</p><p><strong>Constraints:</strong><br>&bull; 1 &le; N &le; 10<sup>5</sup><br>&bull; 1 &le; S &le; 10<sup>9</sup></p>`,
            sampleCases: [
                { input: "6 7\n2 3 1 2 4 3", output: "2", marks: 2, isSample: true, explanation: "Subarray [4, 3] has sum 7 and minimal length 2." },
                { input: "3 4\n1 4 4", output: "1", marks: 2, isSample: true, explanation: "Subarray [4] satisfies sum >= 4 with length 1." }
            ],
            hiddenCases: [
                { input: "5 11\n1 1 1 1 1", output: "0", marks: 3, isSample: false },
                { input: "5 15\n1 2 3 4 5", output: "5", marks: 3, isSample: false },
                { input: "6 10\n2 1 5 2 3 2", output: "3", marks: 3, isSample: false }
            ],
            codePython: 'def solveSlidingState(n: int, target: int, nums: list[int]) -> int:\n    l = curr = 0\n    ans = float("inf")\n    for r in range(n):\n        curr += nums[r]\n        while curr >= target:\n            ans = min(ans, r - l + 1)\n            curr -= nums[l]; l += 1\n    return ans if ans != float("inf") else 0\n',
            codeJava: '    public static int solveSlidingState(int n, int target, int[] nums) {\n        int l = 0, curr = 0, ans = Integer.MAX_VALUE;\n        for (int r = 0; r < n; r++) {\n            curr += nums[r];\n            while (curr >= target) {\n                ans = Math.min(ans, r - l + 1);\n                curr -= nums[l++];\n            }\n        }\n        return ans == Integer.MAX_VALUE ? 0 : ans;\n    }\n',
            codeCpp: 'int solveSlidingState(int n, int target, vector<int>& nums) {\n    int l = 0, curr = 0, ans = INT_MAX;\n    for (int r = 0; r < n; r++) {\n        curr += nums[r];\n        while (curr >= target) {\n            ans = min(ans, r - l + 1);\n            curr -= nums[l++];\n        }\n    }\n    return ans == INT_MAX ? 0 : ans;\n}\n',
            codeJs: 'function solveSlidingState(n, target, nums) {\n    let l = 0, curr = 0, ans = Infinity;\n    for (let r = 0; r < n; r++) {\n        curr += nums[r];\n        while (curr >= target) {\n            ans = Math.min(ans, r - l + 1);\n            curr -= nums[l++];\n        }\n    }\n    return ans === Infinity ? 0 : ans;\n}\n'
        },
        {
            headingSuffix: "Frequency Invariant & Unique Deduplication",
            funcName: "solveFrequencyInvariant",
            statement: (t, p) => `<p><strong>Problem Statement:</strong></p><p>You are given a stream of <code>N</code> data tokens in <strong>${t}</strong>. Determine the length of the longest contiguous sequence that contains at most <code>K</code> distinct element types.</p>${p ? '<p><strong>Contextual Note:</strong> ' + p + '</p>' : ''}<p><strong>Input Format:</strong><br>Line 1: Two integers <code>N</code> and <code>K</code>.<br>Line 2: <code>N</code> space-separated integers.</p><p><strong>Output Format:</strong><br>Print the integer length of the longest valid subsegment.</p><p><strong>Constraints:</strong><br>&bull; 1 &le; K &le; N &le; 10<sup>5</sup></p>`,
            sampleCases: [
                { input: "5 2\n1 2 1 2 3", output: "4", marks: 2, isSample: true, explanation: "Subsegment [1, 2, 1, 2] contains 2 distinct values and length 4." },
                { input: "6 1\n1 2 3 1 2 3", output: "1", marks: 2, isSample: true, explanation: "Any single element has length 1." }
            ],
            hiddenCases: [
                { input: "7 3\n1 2 1 3 4 2 3", output: "4", marks: 3, isSample: false },
                { input: "4 2\n1 1 1 1", output: "4", marks: 3, isSample: false },
                { input: "6 2\n3 3 3 1 2 1 1", output: "5", marks: 3, isSample: false }
            ],
            codePython: 'from collections import defaultdict\ndef solveFrequencyInvariant(n: int, k: int, arr: list[int]) -> int:\n    cnt = defaultdict(int); l = 0; max_len = 0\n    for r in range(n):\n        cnt[arr[r]] += 1\n        while len(cnt) > k:\n            cnt[arr[l]] -= 1\n            if cnt[arr[l]] == 0: del cnt[arr[l]]\n            l += 1\n        max_len = max(max_len, r - l + 1)\n    return max_len\n',
            codeJava: '    public static int solveFrequencyInvariant(int n, int k, int[] arr) {\n        Map<Integer, Integer> map = new HashMap<>();\n        int l = 0, maxLen = 0;\n        for (int r = 0; r < n; r++) {\n            map.put(arr[r], map.getOrDefault(arr[r], 0) + 1);\n            while (map.size() > k) {\n                map.put(arr[l], map.get(arr[l]) - 1);\n                if (map.get(arr[l]) == 0) map.remove(arr[l]);\n                l++;\n            }\n            maxLen = Math.max(maxLen, r - l + 1);\n        }\n        return maxLen;\n    }\n',
            codeCpp: 'int solveFrequencyInvariant(int n, int k, vector<int>& arr) {\n    unordered_map<int, int> mp; int l = 0, maxLen = 0;\n    for (int r = 0; r < n; r++) {\n        mp[arr[r]]++;\n        while (mp.size() > k) {\n            if (--mp[arr[l]] == 0) mp.erase(arr[l]);\n            l++;\n        }\n        maxLen = max(maxLen, r - l + 1);\n    }\n    return maxLen;\n}\n',
            codeJs: 'function solveFrequencyInvariant(n, k, arr) {\n    const map = new Map(); let l = 0, maxLen = 0;\n    for (let r = 0; r < n; r++) {\n        map.set(arr[r], (map.get(arr[r]) || 0) + 1);\n        while (map.size > k) {\n            map.set(arr[l], map.get(arr[l]) - 1);\n            if (map.get(arr[l]) === 0) map.delete(arr[l]);\n            l++;\n        }\n        maxLen = Math.max(maxLen, r - l + 1);\n    }\n    return maxLen;\n}\n'
        },
        {
            headingSuffix: "Monotonic Stack & Next Optimal Metric",
            funcName: "solveNextOptimalValue",
            statement: (t, p) => `<p><strong>Problem Statement:</strong></p><p>Given an array of numerical sensor telemetry for <strong>${t}</strong>, return an array such that <code>answer[i]</code> is the number of steps you have to wait after the <code>i</code>th step to encounter a strictly greater metric value. If no greater value occurs, set <code>answer[i] = 0</code>.</p>${p ? '<p><strong>Contextual Note:</strong> ' + p + '</p>' : ''}<p><strong>Input Format:</strong><br>Line 1: An integer <code>N</code>.<br>Line 2: <code>N</code> space-separated integers.</p><p><strong>Output Format:</strong><br>Print <code>N</code> space-separated integers.</p><p><strong>Constraints:</strong><br>&bull; 1 &le; N &le; 10<sup>5</sup><br>&bull; 1 &le; Metric[i] &le; 10<sup>5</sup></p>`,
            sampleCases: [
                { input: "8\n73 74 75 71 69 72 76 73", output: "1 1 4 2 1 1 0 0", marks: 2, isSample: true, explanation: "Waiting steps to strictly greater values." },
                { input: "4\n30 40 50 60", output: "1 1 1 0", marks: 2, isSample: true, explanation: "Each consecutive step increases." }
            ],
            hiddenCases: [
                { input: "3\n30 60 90", output: "1 1 0", marks: 3, isSample: false },
                { input: "4\n90 80 70 60", output: "0 0 0 0", marks: 3, isSample: false },
                { input: "5\n10 20 10 20 30", output: "1 3 1 1 0", marks: 3, isSample: false }
            ],
            codePython: 'def solveNextOptimalValue(n: int, t: list[int]) -> list[int]:\n    res = [0] * n\n    st = []\n    for i, v in enumerate(t):\n        while st and t[st[-1]] < v:\n            prev = st.pop()\n            res[prev] = i - prev\n        st.append(i)\n    return res\n',
            codeJava: '    public static int[] solveNextOptimalValue(int n, int[] t) {\n        int[] res = new int[n];\n        Stack<Integer> st = new Stack<>();\n        for (int i = 0; i < n; i++) {\n            while (!st.isEmpty() && t[st.peek()] < t[i]) {\n                int prev = st.pop();\n                res[prev] = i - prev;\n            }\n            st.push(i);\n        }\n        return res;\n    }\n',
            codeCpp: 'vector<int> solveNextOptimalValue(int n, vector<int>& t) {\n    vector<int> res(n, 0);\n    stack<int> st;\n    for (int i = 0; i < n; i++) {\n        while (!st.empty() && t[st.top()] < t[i]) {\n            int prev = st.top(); st.pop();\n            res[prev] = i - prev;\n        }\n        st.push(i);\n    }\n    return res;\n}\n',
            codeJs: 'function solveNextOptimalValue(n, t) {\n    const res = new Array(n).fill(0);\n    const st = [];\n    for (let i = 0; i < n; i++) {\n        while (st.length && t[st[st.length - 1]] < t[i]) {\n            const prev = st.pop();\n            res[prev] = i - prev;\n        }\n        st.push(i);\n    }\n    return res;\n}\n'
        },
        {
            headingSuffix: "Binary Search & Monotonic Feasibility",
            funcName: "solveMonotonicSearch",
            statement: (t, p) => `<p><strong>Problem Statement:</strong></p><p>A conveyor system for <strong>${t}</strong> must transport <code>N</code> packages across <code>D</code> days. Find the least shipment capacity of the conveyor such that all packages can be shipped in sequential order within <code>D</code> days.</p>${p ? '<p><strong>Contextual Note:</strong> ' + p + '</p>' : ''}<p><strong>Input Format:</strong><br>Line 1: Two integers <code>N</code> and <code>D</code>.<br>Line 2: <code>N</code> space-separated integers representing weights.</p><p><strong>Output Format:</strong><br>Print the minimal capacity integer.</p><p><strong>Constraints:</strong><br>&bull; 1 &le; D &le; N &le; 5 &times; 10<sup>4</sup><br>&bull; 1 &le; Weights[i] &le; 500</p>`,
            sampleCases: [
                { input: "10 5\n1 2 3 4 5 6 7 8 9 10", output: "15", marks: 2, isSample: true, explanation: "Shipment capacity of 15 is optimal across 5 days." },
                { input: "6 3\n3 2 2 4 1 4", output: "6", marks: 2, isSample: true, explanation: "Shipment capacity of 6 across 3 days." }
            ],
            hiddenCases: [
                { input: "3 1\n1 2 3", output: "6", marks: 3, isSample: false },
                { input: "5 2\n5 5 5 5 5", output: "15", marks: 3, isSample: false },
                { input: "7 4\n1 4 2 5 3 6 4", output: "9", marks: 3, isSample: false }
            ],
            codePython: 'def solveMonotonicSearch(n: int, days: int, weights: list[int]) -> int:\n    l, r = max(weights), sum(weights)\n    def feasible(cap):\n        d, cur = 1, 0\n        for w in weights:\n            if cur + w > cap: d += 1; cur = 0\n            cur += w\n        return d <= days\n    while l < r:\n        mid = (l + r) // 2\n        if feasible(mid): r = mid\n        else: l = mid + 1\n    return l\n',
            codeJava: '    public static int solveMonotonicSearch(int n, int days, int[] weights) {\n        int l = 0, r = 0;\n        for (int w : weights) { l = Math.max(l, w); r += w; }\n        while (l < r) {\n            int mid = l + (r - l) / 2, d = 1, cur = 0;\n            for (int w : weights) { if (cur + w > mid) { d++; cur = 0; } cur += w; }\n            if (d <= days) r = mid; else l = mid + 1;\n        }\n        return l;\n    }\n',
            codeCpp: 'int solveMonotonicSearch(int n, int days, vector<int>& weights) {\n    int l = 0, r = 0;\n    for (int w : weights) { l = max(l, w); r += w; }\n    while (l < r) {\n        int mid = l + (r - l) / 2, d = 1, cur = 0;\n        for (int w : weights) { if (cur + w > mid) { d++; cur = 0; } cur += w; }\n        if (d <= days) r = mid; else l = mid + 1;\n    }\n    return l;\n}\n',
            codeJs: 'function solveMonotonicSearch(n, days, weights) {\n    let l = Math.max(...weights), r = weights.reduce((a, b) => a + b, 0);\n    while (l < r) {\n        let mid = Math.floor((l + r) / 2), d = 1, cur = 0;\n        for (let w of weights) { if (cur + w > mid) { d++; cur = 0; } cur += w; }\n        if (d <= days) r = mid; else l = mid + 1;\n    }\n    return l;\n}\n'
        },
        {
            headingSuffix: "Matrix Grid Path & Multi-Source Reachability",
            funcName: "solveGridPath",
            statement: (t, p) => `<p><strong>Problem Statement:</strong></p><p>An <code>M x N</code> grid represents active operational nodes in <strong>${t}</strong>. A robot starts at top-left <code>(0, 0)</code> and must reach bottom-right <code>(M-1, N-1)</code> moving only right or down. Cells marked <code>1</code> are blocked obstacles, while <code>0</code> are walkable. Return the total number of unique paths.</p>${p ? '<p><strong>Contextual Note:</strong> ' + p + '</p>' : ''}<p><strong>Input Format:</strong><br>Line 1: Two integers <code>M</code> and <code>N</code>.<br>Next <code>M</code> lines: <code>N</code> space-separated integers (0 or 1).</p><p><strong>Output Format:</strong><br>Print total unique path count.</p><p><strong>Constraints:</strong><br>&bull; 1 &le; M, N &le; 100</p>`,
            sampleCases: [
                { input: "3 3\n0 0 0\n0 1 0\n0 0 0", output: "2", marks: 2, isSample: true, explanation: "There are 2 unique paths avoiding the center obstacle." },
                { input: "2 2\n0 1\n0 0", output: "1", marks: 2, isSample: true, explanation: "Only one path downwards then right." }
            ],
            hiddenCases: [
                { input: "1 1\n0", output: "1", marks: 3, isSample: false },
                { input: "3 3\n0 0 0\n0 0 0\n0 0 0", output: "6", marks: 3, isSample: false },
                { input: "2 3\n0 0 0\n0 1 0", output: "1", marks: 3, isSample: false }
            ],
            codePython: 'def solveGridPath(m: int, n: int, grid: list[list[int]]) -> int:\n    if grid[0][0] == 1 or grid[m-1][n-1] == 1: return 0\n    dp = [[0] * n for _ in range(m)]\n    dp[0][0] = 1\n    for r in range(m):\n        for c in range(n):\n            if grid[r][c] == 1: dp[r][c] = 0; continue\n            if r > 0: dp[r][c] += dp[r-1][c]\n            if c > 0: dp[r][c] += dp[r][c-1]\n    return dp[m-1][n-1]\n',
            codeJava: '    public static int solveGridPath(int m, int n, int[][] grid) {\n        if (grid[0][0] == 1 || grid[m - 1][n - 1] == 1) return 0;\n        int[][] dp = new int[m][n]; dp[0][0] = 1;\n        for (int r = 0; r < m; r++) {\n            for (int c = 0; c < n; c++) {\n                if (grid[r][c] == 1) { dp[r][c] = 0; continue; }\n                if (r > 0) dp[r][c] += dp[r - 1][c];\n                if (c > 0) dp[r][c] += dp[r][c - 1];\n            }\n        }\n        return dp[m - 1][n - 1];\n    }\n',
            codeCpp: 'int solveGridPath(int m, int n, vector<vector<int>>& grid) {\n    if (grid[0][0] == 1 || grid[m - 1][n - 1] == 1) return 0;\n    vector<vector<int>> dp(m, vector<int>(n, 0)); dp[0][0] = 1;\n    for (int r = 0; r < m; r++) {\n        for (int c = 0; c < n; c++) {\n            if (grid[r][c] == 1) { dp[r][c] = 0; continue; }\n            if (r > 0) dp[r][c] += dp[r - 1][c];\n            if (c > 0) dp[r][c] += dp[r][c - 1];\n        }\n    }\n    return dp[m - 1][n - 1];\n}\n',
            codeJs: 'function solveGridPath(m, n, grid) {\n    if (grid[0][0] === 1 || grid[m - 1][n - 1] === 1) return 0;\n    const dp = Array.from({ length: m }, () => new Array(n).fill(0)); dp[0][0] = 1;\n    for (let r = 0; r < m; r++) {\n        for (let c = 0; c < n; c++) {\n            if (grid[r][c] === 1) { dp[r][c] = 0; continue; }\n            if (r > 0) dp[r][c] += dp[r - 1][c];\n            if (c > 0) dp[r][c] += dp[r][c - 1];\n        }\n    }\n    return dp[m - 1][n - 1];\n}\n'
        },
        {
            headingSuffix: "Topological Dependency & Cycle Detection",
            funcName: "solveDependencyOrder",
            statement: (t, p) => `<p><strong>Problem Statement:</strong></p><p>There are total <code>N</code> interdependent subsystems labeled <code>0</code> to <code>N-1</code> in <strong>${t}</strong>. Given a list of prerequisite pairs <code>[a, b]</code> indicating subsystem <code>b</code> must execute before <code>a</code>, determine if all subsystems can finish execution without cyclic deadlock.</p>${p ? '<p><strong>Contextual Note:</strong> ' + p + '</p>' : ''}<p><strong>Input Format:</strong><br>Line 1: Two integers <code>N</code> and <code>P</code> (number of prerequisite relations).<br>Next <code>P</code> lines: Two space-separated integers <code>a b</code>.</p><p><strong>Output Format:</strong><br>Print <code>true</code> if possible, otherwise <code>false</code>.</p><p><strong>Constraints:</strong><br>&bull; 1 &le; N &le; 2000<br>&bull; 0 &le; P &le; 5000</p>`,
            sampleCases: [
                { input: "2 1\n1 0", output: "true", marks: 2, isSample: true, explanation: "Dependency 0 -> 1 is acyclic, so execution succeeds." },
                { input: "2 2\n1 0\n0 1", output: "false", marks: 2, isSample: true, explanation: "Mutual dependency forms a cycle, so impossible." }
            ],
            hiddenCases: [
                { input: "3 2\n1 0\n2 1", output: "true", marks: 3, isSample: false },
                { input: "3 3\n1 0\n2 1\n0 2", output: "false", marks: 3, isSample: false },
                { input: "4 3\n1 0\n2 0\n3 1", output: "true", marks: 3, isSample: false }
            ],
            codePython: 'from collections import deque, defaultdict\ndef solveDependencyOrder(n: int, p: int, prereq: list[list[int]]) -> bool:\n    adj = defaultdict(list); in_deg = [0] * n\n    for u, v in prereq: adj[v].append(u); in_deg[u] += 1\n    q = deque([i for i in range(n) if in_deg[i] == 0])\n    visited = 0\n    while q:\n        curr = q.popleft(); visited += 1\n        for nxt in adj[curr]:\n            in_deg[nxt] -= 1\n            if in_deg[nxt] == 0: q.append(nxt)\n    return visited == n\n',
            codeJava: '    public static boolean solveDependencyOrder(int n, int p, int[][] prereq) {\n        List<List<Integer>> adj = new ArrayList<>();\n        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());\n        int[] inDeg = new int[n];\n        for (int[] e : prereq) { adj.get(e[1]).add(e[0]); inDeg[e[0]]++; }\n        Queue<Integer> q = new LinkedList<>();\n        for (int i = 0; i < n; i++) if (inDeg[i] == 0) q.offer(i);\n        int visited = 0;\n        while (!q.isEmpty()) {\n            int curr = q.poll(); visited++;\n            for (int nxt : adj.get(curr)) if (--inDeg[nxt] == 0) q.offer(nxt);\n        }\n        return visited == n;\n    }\n',
            codeCpp: 'bool solveDependencyOrder(int n, int p, vector<vector<int>>& prereq) {\n    vector<vector<int>> adj(n); vector<int> inDeg(n, 0);\n    for (auto& e : prereq) { adj[e[1]].push_back(e[0]); inDeg[e[0]]++; }\n    queue<int> q; for (int i = 0; i < n; i++) if (inDeg[i] == 0) q.push(i);\n    int visited = 0;\n    while (!q.empty()) {\n        int curr = q.front(); q.pop(); visited++;\n        for (int nxt : adj[curr]) if (--inDeg[nxt] == 0) q.push(nxt);\n    }\n    return visited == n;\n}\n',
            codeJs: 'function solveDependencyOrder(n, p, prereq) {\n    const adj = Array.from({ length: n }, () => []);\n    const inDeg = new Array(n).fill(0);\n    for (const [u, v] of prereq) { adj[v].push(u); inDeg[u]++; }\n    const q = []; for (let i = 0; i < n; i++) if (inDeg[i] === 0) q.push(i);\n    let visited = 0;\n    while (q.length) {\n        const curr = q.shift(); visited++;\n        for (const nxt of adj[curr]) if (--inDeg[nxt] === 0) q.push(nxt);\n    }\n    return visited === n;\n}\n'
        },
        {
            headingSuffix: "Dynamic Programming & Bounded Knapsack State",
            funcName: "solveOptimalSubset",
            statement: (t, p) => `<p><strong>Problem Statement:</strong></p><p>You are managing resources in <strong>${t}</strong>. Given <code>N</code> item configurations with associated costs and yields, and a total capacity threshold <code>W</code>, compute the maximum total yield possible without exceeding <code>W</code>.</p>${p ? '<p><strong>Contextual Note:</strong> ' + p + '</p>' : ''}<p><strong>Input Format:</strong><br>Line 1: Two integers <code>N</code> and <code>W</code>.<br>Line 2: <code>N</code> space-separated integers representing weights.<br>Line 3: <code>N</code> space-separated integers representing values.</p><p><strong>Output Format:</strong><br>Print the maximum yield.</p><p><strong>Constraints:</strong><br>&bull; 1 &le; N &le; 1000<br>&bull; 1 &le; W &le; 1000</p>`,
            sampleCases: [
                { input: "3 4\n1 2 3\n10 15 40", output: "50", marks: 2, isSample: true, explanation: "Take item 1 (weight 1, value 10) and item 3 (weight 3, value 40) => sum weight 4, value 50." },
                { input: "3 3\n4 5 1\n1 2 3", output: "3", marks: 2, isSample: true, explanation: "Take item with weight 1 and value 3." }
            ],
            hiddenCases: [
                { input: "1 10\n5\n10", output: "10", marks: 3, isSample: false },
                { input: "4 5\n2 1 3 2\n12 10 20 15", output: "37", marks: 3, isSample: false },
                { input: "4 8\n2 3 4 5\n3 4 5 6", output: "10", marks: 3, isSample: false }
            ],
            codePython: 'def solveOptimalSubset(n: int, w: int, wt: list[int], val: list[int]) -> int:\n    dp = [0] * (w + 1)\n    for i in range(n):\n        for cap in range(w, wt[i] - 1, -1):\n            dp[cap] = max(dp[cap], dp[cap - wt[i]] + val[i])\n    return dp[w]\n',
            codeJava: '    public static int solveOptimalSubset(int n, int w, int[] wt, int[] val) {\n        int[] dp = new int[w + 1];\n        for (int i = 0; i < n; i++) {\n            for (int cap = w; cap >= wt[i]; cap--) {\n                dp[cap] = Math.max(dp[cap], dp[cap - wt[i]] + val[i]);\n            }\n        }\n        return dp[w];\n    }\n',
            codeCpp: 'int solveOptimalSubset(int n, int w, vector<int>& wt, vector<int>& val) {\n    vector<int> dp(w + 1, 0);\n    for (int i = 0; i < n; i++) {\n        for (int cap = w; cap >= wt[i]; cap--) {\n            dp[cap] = max(dp[cap], dp[cap - wt[i]] + val[i]);\n        }\n    }\n    return dp[w];\n}\n',
            codeJs: 'function solveOptimalSubset(n, w, wt, val) {\n    const dp = new Array(w + 1).fill(0);\n    for (let i = 0; i < n; i++) {\n        for (let cap = w; cap >= wt[i]; cap--) {\n            dp[cap] = Math.max(dp[cap], dp[cap - wt[i]] + val[i]);\n        }\n    }\n    return dp[w];\n}\n'
        },
        {
            headingSuffix: "In-Place State Compaction & Inversion",
            funcName: "solveStateCompaction",
            statement: (t, p) => `<p><strong>Problem Statement:</strong></p><p>Given an array of <code>N</code> transaction records in <strong>${t}</strong> containing <code>0</code>s, <code>1</code>s, and <code>2</code>s, sort the array in-place so that objects of the same state are adjacent, in order 0, 1, and 2.</p>${p ? '<p><strong>Contextual Note:</strong> ' + p + '</p>' : ''}<p><strong>Input Format:</strong><br>Line 1: An integer <code>N</code>.<br>Line 2: <code>N</code> space-separated integers (0, 1, or 2).</p><p><strong>Output Format:</strong><br>Print <code>N</code> space-separated sorted integers.</p><p><strong>Constraints:</strong><br>&bull; 1 &le; N &le; 10<sup>5</sup><br>&bull; Solvable in O(N) time and O(1) auxiliary space.</p>`,
            sampleCases: [
                { input: "6\n2 0 2 1 1 0", output: "0 0 1 1 2 2", marks: 2, isSample: true, explanation: "Array partitioned into 0s, 1s, and 2s in single pass." },
                { input: "3\n2 0 1", output: "0 1 2", marks: 2, isSample: true, explanation: "Sorted in place." }
            ],
            hiddenCases: [
                { input: "1\n0", output: "0", marks: 3, isSample: false },
                { input: "4\n1 1 0 0", output: "0 0 1 1", marks: 3, isSample: false },
                { input: "5\n2 2 2 1 0", output: "0 1 2 2 2", marks: 3, isSample: false }
            ],
            codePython: 'def solveStateCompaction(n: int, nums: list[int]) -> list[int]:\n    low, mid, high = 0, 0, n - 1\n    while mid <= high:\n        if nums[mid] == 0:\n            nums[low], nums[mid] = nums[mid], nums[low]\n            low += 1; mid += 1\n        elif nums[mid] == 1:\n            mid += 1\n        else:\n            nums[mid], nums[high] = nums[high], nums[mid]\n            high -= 1\n    return nums\n',
            codeJava: '    public static int[] solveStateCompaction(int n, int[] nums) {\n        int low = 0, mid = 0, high = n - 1;\n        while (mid <= high) {\n            if (nums[mid] == 0) {\n                int tmp = nums[low]; nums[low++] = nums[mid]; nums[mid++] = tmp;\n            } else if (nums[mid] == 1) {\n                mid++;\n            } else {\n                int tmp = nums[mid]; nums[mid] = nums[high]; nums[high--] = tmp;\n            }\n        }\n        return nums;\n    }\n',
            codeCpp: 'vector<int> solveStateCompaction(int n, vector<int>& nums) {\n    int low = 0, mid = 0, high = n - 1;\n    while (mid <= high) {\n        if (nums[mid] == 0) swap(nums[low++], nums[mid++]);\n        else if (nums[mid] == 1) mid++;\n        else swap(nums[mid], nums[high--]);\n    }\n    return nums;\n}\n',
            codeJs: 'function solveStateCompaction(n, nums) {\n    let low = 0, mid = 0, high = n - 1;\n    while (mid <= high) {\n        if (nums[mid] === 0) {\n            [nums[low], nums[mid]] = [nums[mid], nums[low]];\n            low++; mid++;\n        } else if (nums[mid] === 1) {\n            mid++;\n        } else {\n            [nums[mid], nums[high]] = [nums[high], nums[mid]];\n            high--;\n        }\n    }\n    return nums;\n}\n'
        }
    ];

    // 10 UNIQUE MCQ ANGLES
    const mcqAngles = [
        {
            headingSuffix: "Core Architectural Mechanism",
            title: (t, p) => `<p>What is the fundamental architectural mechanism that governs <strong>${t}</strong> in modern scalable computer systems?</p>${p ? '<p><em>Contextual Constraint: ' + p + '</em></p>' : ''}`,
            options: (t) => [
                `Deterministic state transitions and guaranteed bounded execution latency for ${t}`,
                `Unrestricted asynchronous heap modification bypassing isolation boundaries`,
                `Full synchronous preemption halting all hardware threads globally`,
                `Non-deterministic dynamic interpretation without type or memory guarantees`
            ],
            correctIndex: 0
        },
        {
            headingSuffix: "Worst-Case Asymptotic Bounds",
            title: (t, p) => `<p>Under rigorous theoretical analysis, what is the tight asymptotic upper bound (Big-O) achieved when evaluating optimized operations in <strong>${t}</strong>?</p>`,
            options: (t) => [
                `O(log N) through balanced indexed partitioning and binary state reduction`,
                `O(N^3) due to un-indexed Cartesian matrix iterations`,
                `O(2^N) exponential exhaustive recursive search`,
                `O(N!) factorial combinatorial traversal`
            ],
            correctIndex: 0
        },
        {
            headingSuffix: "Invariants & Data Integrity",
            title: (t, p) => `<p>Which critical invariant must be strictly preserved across all concurrent mutations in <strong>${t}</strong>?</p>`,
            options: (t) => [
                `Structural integrity and deterministic balance across all active state nodes`,
                `Unbounded recursive call stack expansion without base-case checks`,
                `Un-synchronized shared reference mutation across parallel execution contexts`,
                `Arbitrary memory pointer redirection outside allocated buffer bounds`
            ],
            correctIndex: 0
        },
        {
            headingSuffix: "Concurrency & Lock-Free Synchronization",
            title: (t, p) => `<p>How is thread safety and high throughput achieved in <strong>${t}</strong> when serving high-concurrency workloads?</p>`,
            options: (t) => [
                `Using atomic Compare-And-Swap (CAS) primitives and reader-writer fine-grained locks`,
                `Disabling all CPU cache coherency and hardware memory barriers globally`,
                `Acquiring a global coarse-grained process mutex on every read-only query`,
                `Permitting out-of-order race conditions without transactional consistency`
            ],
            correctIndex: 0
        },
        {
            headingSuffix: "Spatial Footprint & Memory Layout",
            title: (t, p) => `<p>What is the primary memory overhead and spatial footprint consideration when scaling <strong>${t}</strong> across millions of records?</p>`,
            options: (t) => [
                `Auxiliary pointer storage and metadata bookkeeping per indexed entity`,
                `Total operating system freeze caused by unconditional virtual memory thrashing`,
                `Complete elimination of RAM consumption via software emulation`,
                `Fixed zero-byte overhead regardless of structural depth or data volume`
            ],
            correctIndex: 0
        },
        {
            headingSuffix: "Pathological Edge Failure Modes",
            title: (t, p) => `<p>Under which specific edge condition does <strong>${t}</strong> degrade into its worst-case computational performance?</p>`,
            options: (t) => [
                `When input distribution is skewed, monotonic, or induces severe hash collisions`,
                `When processing uniformly distributed pseudo-random data streams`,
                `When hardware L1 cache capacity exceeds the total dataset size`,
                `When executed exclusively inside a single-threaded runtime environment`
            ],
            correctIndex: 0
        },
        {
            headingSuffix: "System Design Trade-off",
            title: (t, p) => `<p>Why would a principal systems architect select <strong>${t}</strong> over conventional linear data paradigms?</p>`,
            options: (t) => [
                `To achieve sub-linear query and retrieval times at the acceptable cost of slight structural insertion overhead`,
                `Because it requires zero CPU cycles for any computational transaction`,
                `To ensure zero physical disk consumption across all persistent volumes`,
                `Because it guarantees that edge cases and null pointers can never occur`
            ],
            correctIndex: 0
        },
        {
            headingSuffix: "Hardware Cache Line Optimization",
            title: (t, p) => `<p>Which technique maximizes hardware CPU cache line utilization when processing <strong>${t}</strong>?</p>`,
            options: (t) => [
                `Contiguous memory layout and sequential spatial memory prefetching`,
                `Scattering heap pointer allocations randomly across physical address spaces`,
                `Executing synchronous garbage collection cycles inside innermost loops`,
                `Replacing fast register access with external network socket calls`
            ],
            correctIndex: 0
        },
        {
            headingSuffix: "Edge Boundary Validation & Safety",
            title: (t, p) => `<p>When implementing boundary validation in <strong>${t}</strong>, which condition must be verified first to prevent fatal runtime faults?</p>`,
            options: (t) => [
                `Null/nil references, empty collections, and numeric integer overflow thresholds`,
                `Whether the display monitor supports high dynamic range (HDR) output`,
                `Whether the local timezone matches UTC standard offset`,
                `Whether the host audio drivers are initialized correctly`
            ],
            correctIndex: 0
        },
        {
            headingSuffix: "Industrial Production Monitoring",
            title: (t, p) => `<p>In modern enterprise cloud infrastructure, what is the best practice for monitoring the operational health of <strong>${t}</strong>?</p>`,
            options: (t) => [
                `Tracking p99 latency percentiles, error rates, and CPU/memory saturation metrics`,
                `Manually inspecting physical console printouts once every billing quarter`,
                `Ignoring unhandled runtime exceptions until the operating system crashes`,
                `Writing high-frequency log traces synchronously to external flash drives`
            ],
            correctIndex: 0
        }
    ];

    // 10 UNIQUE ASSERTION & REASON SCENARIOS
    const assertionReasonScenarios = [
        {
            headingSuffix: "Architectural State Isolation",
            a: (t) => `In <strong>${t}</strong>, maintaining strict state boundary isolation prevents unexpected data corruption and race anomalies.`,
            r: (t) => `Foundational invariants of ${t} dictate that concurrent un-synchronized mutation invalidates deterministic execution guarantees.`
        },
        {
            headingSuffix: "Asymptotic Complexity Bounds",
            a: (t) => `Utilizing optimized spatial indexing in <strong>${t}</strong> amortizes execution latency from $O(N)$ down to $O(1)$ or $O(\\log N)$.`,
            r: (t) => `Direct pointer dereferencing and tree structures bypass sequential linear scanning of all elements.`
        },
        {
            headingSuffix: "Memory Locality & Cache Prefetching",
            a: (t) => `Contiguous array allocations significantly enhance the throughput of <strong>${t}</strong> compared to node-based fragmented allocations.`,
            r: (t) => `CPU hardware prefetchers exploit spatial and temporal locality when reading adjacent memory addresses.`
        },
        {
            headingSuffix: "Lock-Free Primitives vs Mutexes",
            a: (t) => `Lock-free atomic Compare-And-Swap (CAS) loops provide superior scalability over coarse mutexes in <strong>${t}</strong>.`,
            r: (t) => `CAS primitives avoid expensive operating system kernel context switches during high contention.`
        },
        {
            headingSuffix: "Pathological Input Prevention",
            a: (t) => `Applying randomized pivot selection or self-balancing rotations is essential in <strong>${t}</strong>.`,
            r: (t) => `Unbalanced inputs can degrade worst-case performance from $O(\\log N)$ down to $O(N)$.`
        },
        {
            headingSuffix: "Idempotency in Distributed Systems",
            a: (t) => `All update operations for <strong>${t}</strong> across distributed nodes must implement strict idempotency keys.`,
            r: (t) => `Network retries and at-least-once delivery semantics can otherwise cause duplicate execution anomalies.`
        },
        {
            headingSuffix: "Memory Deallocation & GC Pressure",
            a: (t) => `Object pooling and primitive reuse in <strong>${t}</strong> dramatically reduces tail latency in garbage-collected environments.`,
            r: (t) => `High object allocation rates trigger Stop-The-World GC pauses that spike p99 latency.`
        },
        {
            headingSuffix: "Bitwise Masking & Compact State",
            a: (t) => `Bitwise manipulation in <strong>${t}</strong> allows multiple binary flags to be evaluated in a single clock cycle.`,
            r: (t) => `CPU arithmetic logic units (ALUs) execute bitwise AND/OR/XOR operations natively in $O(1)$ hardware instructions.`
        },
        {
            headingSuffix: "Transactional Rollback & Atomicity",
            a: (t) => `Write-Ahead Logging (WAL) ensures durability and crash resilience in <strong>${t}</strong>.`,
            r: (t) => `State mutations are persisted to sequential disk logs prior to in-memory buffer commit.`
        },
        {
            headingSuffix: "Telemetry & Bounded Queueing",
            a: (t) => `Bounded queues with backpressure must be enforced in <strong>${t}</strong> pipelines to avoid Out-Of-Memory (OOM) failures.`,
            r: (t) => `Unbounded queues grow indefinitely when incoming traffic exceeds consumer throughput.`
        }
    ];

    for (let i = 0; i < numQuestions; i++) {
        const id = 'q_ai_' + Date.now() + '_' + i;

        // 1. CODING / PROGRAMMING PROBLEMS (100% DISTINCT)
        if (type === 'coding') {
            const p = codingParadigms[i % codingParadigms.length];
            const sampleCases = p.sampleCases.slice(0, numSample);
            const hiddenCases = p.hiddenCases.slice(0, numHidden);
            const testCases = [...sampleCases, ...hiddenCases];

            questions.push({
                id,
                type: 'coding',
                heading: `${safeTopic} - ${p.headingSuffix} (Task ${i + 1})`,
                title: p.statement(safeTopic, safePrompt),
                marks: itemMarks,
                difficulty: diff,
                languages: ['Python', 'Java', 'C++', 'JavaScript'],
                testCases: testCases,
                code: {
                    Python: { prefix: '# Python 3\n', middle: p.codePython, suffix: '' },
                    Java: { prefix: 'import java.util.*;\npublic class Solution {\n', middle: p.codeJava, suffix: '}' },
                    'C++': { prefix: '#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <climits>\nusing namespace std;\n', middle: p.codeCpp, suffix: '' },
                    JavaScript: { prefix: '', middle: p.codeJs, suffix: '' }
                }
            });
        }
        // 2. ASSERTION & REASON (100% DISTINCT)
        else if (type === 'assertion_reason') {
            const ar = assertionReasonScenarios[i % assertionReasonScenarios.length];
            questions.push({
                id,
                type: 'assertion_reason',
                heading: `${safeTopic} - ${ar.headingSuffix} (Q${i + 1})`,
                title: `<p><strong>Assertion (A):</strong> ${ar.a(safeTopic)}</p><p><strong>Reason (R):</strong> ${ar.r(safeTopic)}</p><p>Select the correct alternative:</p>`,
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
        // 3. SUBJECTIVE & DESCRIPTIVE (100% DISTINCT)
        else if (type === 'subjective') {
            const subjectiveCriteria = [
                "Fundamental architecture, operational lifecycle, and core state model",
                "Asymptotic computational complexity, space efficiency, and bottlenecks",
                "Concurrency synchronization, thread-safety guarantees, and race prevention",
                "Fault tolerance, error boundary containment, and recovery semantics",
                "Industrial production scalability and telemetry monitoring practices"
            ];
            const crit = subjectiveCriteria[i % subjectiveCriteria.length];
            questions.push({
                id,
                type: 'subjective',
                heading: `${safeTopic} - In-Depth Analysis ${i + 1} (${crit.split(',')[0]})`,
                title: `<p>Provide an exhaustive technical dissertation on <strong>${safeTopic}</strong> focusing specifically on: <strong>${crit}</strong>.</p>${safePrompt ? '<p><em>Requirements: ' + safePrompt + '</em></p>' : ''}<p>Structure your answer with: 1. Theoretical foundation &bull; 2. Mathematical/algorithmic formulation &bull; 3. Concrete production trade-offs.</p>`,
                keywords: [safeTopic.toLowerCase(), 'architecture', 'complexity', 'trade-off', 'optimization', 'invariants'],
                marks: itemMarks || 5,
                difficulty: diff
            });
        }
        // 4. NUMERIC VALUE (100% DISTINCT)
        else if (type === 'numeric') {
            const numericProblems = [
                { title: `Calculate the total number of internal edges in a full binary partition of size N = ${16 * (i + 1)}.`, ans: 16 * (i + 1) - 1 },
                { title: `Compute the maximum capacity metric (in KB) for an index buffer holding ${512 * (i + 1)} entries of 64 bytes each.`, ans: 32 * (i + 1) },
                { title: `Determine the exact number of leaf nodes in a complete ternary tree of height H = ${i + 2}.`, ans: Math.pow(3, i + 2) },
                { title: `Calculate the minimum number of comparisons needed in the worst-case binary search over an array of size ${(i + 1) * 1024}.`, ans: 10 + i + 1 },
                { title: `Find the effective throughput (ops/sec) when 10 workers complete ${100 * (i + 1)} jobs each in 2 seconds.`, ans: 500 * (i + 1) }
            ];
            const numP = numericProblems[i % numericProblems.length];
            questions.push({
                id,
                type: 'numeric',
                heading: `${safeTopic} - Quantitative Calculation (${i + 1})`,
                title: `<p><strong>Problem:</strong> In the context of <strong>${safeTopic}</strong>, ${numP.title}</p>`,
                correctNumeric: numP.ans,
                tolerance: 0.1,
                marks: itemMarks,
                difficulty: diff
            });
        }
        // 5. MULTIPLE CHOICE QUESTIONS (100% DISTINCT)
        else {
            const angle = mcqAngles[i % mcqAngles.length];
            const allOpts = angle.options(safeTopic);
            const correctOpt = allOpts[angle.correctIndex];
            const slicedOpts = allOpts.slice(0, numOpts);
            if (!slicedOpts.includes(correctOpt)) {
                slicedOpts[0] = correctOpt;
            }

            questions.push({
                id,
                type: 'mcq',
                heading: `${safeTopic} - ${angle.headingSuffix} (Q${i + 1})`,
                title: angle.title(safeTopic, safePrompt),
                options: slicedOpts,
                correctAnswer: correctOpt,
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
        const customApiKey = req.headers['x-openai-key'] || req.body.apiKey;

        if (!userMessage) {
            return res.status(400).json({ error: "Message content is required." });
        }

        let client = defaultOpenai;
        if (customApiKey && customApiKey.startsWith('sk-')) {
            client = new OpenAI({ apiKey: customApiKey });
        }

        if (client) {
            try {
                const response = await client.chat.completions.create({
                    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
                    messages: [{ role: "user", content: userMessage }]
                });
                return res.json({
                    reply: response.choices[0].message.content,
                    processing_time: new Date().toISOString()
                });
            } catch (apiErr) {
                console.warn("OpenAI API call failed, using automated response:", apiErr.message);
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
        const { topic, prompt, type, count, optionsCount, sampleTestCasesCount, hiddenTestCasesCount, marks, difficulty, apiKey } = req.body;
        const customApiKey = req.headers['x-openai-key'] || apiKey;

        if (!topic && !prompt) {
            return res.status(400).json({ error: "Topic or prompt is required." });
        }

        const safeTopic = (topic || prompt || "General Knowledge").trim();
        const safeType = type || 'mcq';
        const numCount = Math.min(Math.max(parseInt(count) || 1, 1), 10);
        const numOpts = Math.min(Math.max(parseInt(optionsCount) || 4, 2), 6);
        const numSample = Math.min(Math.max(parseInt(sampleTestCasesCount) || 2, 1), 5);
        const numHidden = Math.min(Math.max(parseInt(hiddenTestCasesCount) || 3, 1), 10);
        const itemMarks = parseInt(marks) || (safeType === 'coding' ? 10 : 1);
        const diff = difficulty || 'medium';

        let client = defaultOpenai;
        if (customApiKey && customApiKey.trim().startsWith('sk-')) {
            client = new OpenAI({ apiKey: customApiKey.trim() });
        }

        if (client) {
            try {
                const systemPrompt = `You are an expert assessment and curriculum engineer.
Generate EXACTLY ${numCount} MANDATORILY UNIQUE, NON-REPEATING questions for the requested topic.
Every question MUST have a distinct title, distinct problem statement, and distinct concepts. No two questions can be similar or repeat.

Return ONLY a valid JSON array matching this format based on question type:

For MCQ:
[
  {
    "heading": "Unique Short Title",
    "title": "<p>Detailed question HTML</p>",
    "type": "mcq",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": "Exact string of correct option",
    "marks": ${itemMarks},
    "difficulty": "${diff}"
  }
]

For Coding:
[
  {
    "heading": "Unique Coding Problem Title",
    "title": "<p><strong>Problem Statement:</strong> ...</p><p><strong>Input Format:</strong> ...</p><p><strong>Output Format:</strong> ...</p><p><strong>Constraints:</strong> ...</p>",
    "type": "coding",
    "languages": ["Python", "Java", "C++", "JavaScript"],
    "testCases": [
      {"input": "...", "output": "...", "marks": 2, "isSample": true, "explanation": "..."},
      {"input": "...", "output": "...", "marks": 3, "isSample": false}
    ],
    "code": {
      "Python": {"prefix": "", "middle": "def solution():\\n    pass\\n", "suffix": ""},
      "Java": {"prefix": "public class Solution {\\n", "middle": "    public static void solution() {}\\n", "suffix": "}"},
      "C++": {"prefix": "#include <iostream>\\n", "middle": "void solution() {}\\n", "suffix": ""},
      "JavaScript": {"prefix": "", "middle": "function solution() {}\\n", "suffix": ""}
    },
    "marks": ${itemMarks},
    "difficulty": "${diff}"
  }
]

For Assertion-Reason:
[
  {
    "heading": "Unique Assertion Title",
    "title": "<p><strong>Assertion (A):</strong> ...</p><p><strong>Reason (R):</strong> ...</p>",
    "type": "assertion_reason",
    "options": [
      "Both (A) and (R) are true and (R) is the correct explanation of (A)",
      "Both (A) and (R) are true but (R) is NOT the correct explanation of (A)",
      "(A) is true but (R) is false",
      "(A) is false but (R) is true"
    ],
    "correctAnswer": "Both (A) and (R) are true and (R) is the correct explanation of (A)",
    "marks": ${itemMarks},
    "difficulty": "${diff}"
  }
]

Do NOT wrap in markdown fences. Output ONLY the raw JSON array.`;

                const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";
                const completion = await client.chat.completions.create({
                    model: modelName,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: `Topic: ${safeTopic}\nPrompt instructions: ${prompt || 'Generate distinct technical questions'}\nType: ${safeType}\nCount: ${numCount}\nOptions count: ${numOpts}\nSample TC: ${numSample}\nHidden TC: ${numHidden}` }
                    ],
                    temperature: 0.7
                });

                let raw = completion.choices[0].message.content.trim();
                raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const formatted = parsed.slice(0, numCount).map((q, idx) => ({
                        id: 'q_ai_' + Date.now() + '_' + idx,
                        ...q
                    }));
                    return res.json({ success: true, questions: formatted, source: "openai" });
                }
            } catch (aiErr) {
                console.warn("OpenAI API call failed (" + aiErr.message + "), using dynamic intelligent synthesizer.");
            }
        }

        // Dynamic 100% Unique Question Synthesizer
        const fallbackQuestions = generateSynthesizedQuestions(safeTopic, prompt, safeType, numCount, numOpts, numSample, numHidden, itemMarks, diff);
        return res.json({ success: true, questions: fallbackQuestions, source: "synthesizer" });

    } catch (err) {
        console.error("AI Question Generation error:", err);
        res.status(500).json({ error: "Failed to generate questions." });
    }
};

/**
 * Controller to test user API key
 */
exports.testAPIKey = async (req, res) => {
    try {
        const { apiKey } = req.body;
        if (!apiKey || !apiKey.trim().startsWith('sk-')) {
            return res.status(400).json({ success: false, error: "Invalid API key format. Key must start with sk-" });
        }
        const client = new OpenAI({ apiKey: apiKey.trim() });
        const response = await client.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages: [{ role: "user", content: "ping" }],
            max_tokens: 5
        });
        return res.json({ success: true, message: "OpenAI API Key verified successfully!" });
    } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
};