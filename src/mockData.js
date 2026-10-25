// File: src/mockData.js
export const mockDashboardData = {
  parent: {
    name: "Nguyễn Thị Mai",
    email: "mai.nguyen@example.com",
    role: "Quản trị • Đã bật 2FA",
    syncStatus: "Đã đồng bộ"
  },
  child: {
    id: 1,
    name: "Bé An (Lớp 8)",
    age: 11,
    device: {
      name: "PC-PhongHoc",
      isOnline: true,
      lastSeen: "2 phút trước"
    },
    screenTime: {
      entertainmentUsedMinutes: 45,
      entertainmentLimitMinutes: 60,
      studyUsedMinutes: 130,
      systemUsedMinutes: 15
    },
    pendingRequest: {
      id: "req_9921",
      type: "TIME_EXTENSION",
      value: "15 phút",
      reason: "Con cần thêm 15 phút để hoàn thành bài nộp cho thầy",
      createdAt: "5 phút trước"
    }
  },
  weeklyUsage: [
    { day: "T2", minutes: 95 },
    { day: "T3", minutes: 80 },
    { day: "T4", minutes: 110 },
    { day: "T5", minutes: 70 },
    { day: "T6", minutes: 105 },
    { day: "T7", minutes: 150 },
    { day: "CN", minutes: 120 }
  ],
  allowedSchedules: [
    {
      id: "sched_study",
      title: "Phần mềm học tập",
      timeRange: "Cả ngày tới 21:00",
      status: "Đang mở",
      category: "STUDY"
    },
    {
      id: "sched_ent",
      title: "Giải trí",
      timeRange: "Tối đa 60 phút/ngày",
      status: "Sắp hết",
      category: "ENTERTAINMENT"
    },
    {
      id: "sched_game",
      title: "Game",
      timeRange: "Mở lại T7 lúc 19:00",
      status: "Đang đóng",
      category: "GAME"
    }
  ],
  requestsHistory: [
    {
      id: "req_9921",
      type: "TIME_EXTENSION",
      title: "Xin thêm 15 phút",
      value: "15 phút",
      reason: "Con cần thêm 15 phút để hoàn thành bài nộp cho thầy",
      createdAt: "5 phút trước",
      status: "PENDING",
      parentReply: ""
    },
    {
      id: "req_9920",
      type: "TIME_EXTENSION",
      title: "Xin thêm 20 phút",
      value: "20 phút",
      reason: "Con cần hoàn thành bài thuyết trình nhóm môn Khoa học.",
      createdAt: "15 phút trước",
      status: "PENDING",
      parentReply: ""
    },
    {
      id: "req_9918",
      type: "UNBLOCK_WEB",
      title: 'Xin mở "Game xếp hình"',
      value: "puzzle-kids.com",
      reason: "Con đã làm xong bài tập rồi ạ.",
      createdAt: "Hôm qua",
      status: "APPROVED",
      parentReply: "Mẹ đồng ý mở cho con giải trí 30 phút nhé."
    }
  ],
  appUsageTop: [
    { name: "WINWORD.EXE", title: "Microsoft Word", category: "STUDY", minutes: 75 },
    { name: "Code.exe", title: "Visual Studio Code", category: "STUDY", minutes: 55 },
    { name: "League of Legends.exe", title: "Liên Minh Huyền Thoại", category: "ENTERTAINMENT", minutes: 45 },
    { name: "chrome.exe", title: "Google Classroom", category: "STUDY", minutes: 30 }
  ],
  dnsRecentEvents: [
    { domain: "bet88.com", time: "14:20:15", action: "BLOCKED", reason: "Danh mục Cờ bạc độc hại", ruleBy: "Nguyễn Thị Mai" },
    { domain: "google.com", time: "14:22:05", action: "SAFESEARCH", reason: "Ép IP VIP tìm kiếm an toàn", ruleBy: "Hệ thống mặc định" },
    { domain: "chinhphu.vn", time: "14:25:30", action: "ALLOWED", reason: "Danh sách miễn trừ cố định", ruleBy: "Hệ thống ưu tiên" },
    { domain: "hcmus.edu.vn", time: "14:30:10", action: "ALLOWED", reason: "Cổng thông tin trường học", ruleBy: "Hệ thống ưu tiên" }
  ],
  webCategories: [
    { id: "adult", name: "Nội dung người lớn", status: "BLOCK" },
    { id: "gambling", name: "Cờ bạc", status: "BLOCK" },
    { id: "violence", name: "Bạo lực", status: "BLOCK" },
    { id: "social", name: "Mạng xã hội", status: "LIMIT" },
    { id: "education", name: "Giáo dục & học liệu", status: "ALLOW" }
  ],
  policies: {
    curfewStart: "22:00",
    curfewEnd: "06:00",
    safeSearch: true,
    blockAdultGambling: true,
    blockSocialStudyHours: true,
    whitelistProtected: ["chinhphu.vn", "111.vn", ".edu.vn"]
  },
  policyChangeLogs: [
    {
      id: "log_1",
      time: "Hôm nay, 08:30",
      actor: "Nguyễn Thị Mai",
      action: "Đặt giới hạn giải trí 60 phút/ngày"
    },
    {
      id: "log_2",
      time: "Hôm qua, 21:15",
      actor: "Nguyễn Thị Mai",
      action: "Bật chế độ tìm kiếm an toàn SafeSearch & YouTube Hạn chế"
    }
  ],
  pairing: {
    otpCode: "824913",
    expiresInSeconds: 600
  }
};