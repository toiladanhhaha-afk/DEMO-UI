// File: src/ParentPortal.jsx
import React, { useState, useEffect } from 'react';
import {
  Shield, LayoutDashboard, Bell, BarChart3, Sliders,
  Link2, LogIn, LogOut, Plus, Laptop, Lock, RefreshCw,
  ChevronLeft, ExternalLink, Clock, BookOpen,
  History, MessageSquare, CheckCircle2, XCircle, Globe,
  Menu, X, Smartphone, Monitor, Edit3, Check
} from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const getInitials = (fullName = '') => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'PH';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function ParentPortal({
  data,
  onSwitchToAgent,
  onApproveRequest,
  onRejectRequest,
  onUpdateRequestReply,
  onUpdateEntertainmentLimit,
  onUpdatePolicyField,
  onUpdateWebCategory,
  onAddCustomDomain,
  onUpdateDnsRule,
  onToggleDeviceOnline,
  onGenerateOtp,
  onUpdateParentEmail
}) {
  const [activeRoute, setActiveRoute] = useState('/dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // State điều khiển Giao diện Điện thoại (Menu ngăn kéo & Khung giả lập Điện thoại)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [simulateMobile, setSimulateMobile] = useState(false);

  // State Đăng nhập
  const [authMode, setAuthMode] = useState('login');
  const [emailInput, setEmailInput] = useState(data?.parent?.email || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem('access_token') || ''
  );

  // State nhập tên miền tùy chỉnh & Lý do Chặn / Cho phép (/policies)
  const [customDomain, setCustomDomain] = useState('');
  const [customAction, setCustomAction] = useState('BLOCKED');
  const [customReason, setCustomReason] = useState('');
  const [policyMessage, setPolicyMessage] = useState(null);

  // State sửa lý do cho từng Danh mục lọc web
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatReason, setEditingCatReason] = useState('');

  // State sửa lý do trực tiếp cho từng Tên miền trong danh sách DNS
  const [editingDomainKey, setEditingDomainKey] = useState(null);
  const [editingDomainReason, setEditingDomainReason] = useState('');

  // State nhập lời nhắn / lý do khi Duyệt hoặc Từ chối yêu cầu của con (/dashboard & /requests)
  const [replyInputs, setReplyInputs] = useState({});
  const [editingReplyReqId, setEditingReplyReqId] = useState(null);
  const [editingReplyText, setEditingReplyText] = useState('');

  // State đếm ngược OTP (/devices/pair)
  const [countdown, setCountdown] = useState(data?.pairing?.expiresInSeconds ?? 600);

  useEffect(() => {
    setEmailInput(data?.parent?.email || '');
  }, [data?.parent?.email]);

  useEffect(() => {
    setCountdown(data?.pairing?.expiresInSeconds ?? 600);
  }, [data?.pairing?.expiresInSeconds, data?.pairing?.otpCode]);

  useEffect(() => {
    if (activeRoute !== '/devices/pair') return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeRoute]);

  const formatCountdown = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Gợi ý lý do nhanh cho Phụ huynh khi Chặn hoặc Cho phép
  const quickReasons =
    customAction === 'BLOCKED'
      ? [
          'Nội dung không phù hợp lứa tuổi',
          'Chứa trò chơi / cờ bạc gây mất tập trung',
          'Tạm khóa trong khung giờ học bài',
          'Trang web chưa xác thực độ an toàn',
        ]
      : [
          'Trang phục vụ học tập & tra cứu bài giảng',
          'Cổng thông tin trường học / khóa học trực tuyến',
          'Bố/Mẹ cho phép giải trí cuối tuần',
          'Tài liệu tham khảo môn Tin học & Ngoại ngữ',
        ];

  // Tính toán các chỉ số hiển thị từ data
  const screenTime = data?.child?.screenTime || {
    entertainmentUsedMinutes: 0,
    entertainmentLimitMinutes: 60,
    studyUsedMinutes: 0,
    systemUsedMinutes: 0,
  };

  const systemMinutes =
    screenTime.systemUsedMinutes ??
    (data?.appUsageTop || [])
      .filter((a) => a.category === 'SYSTEM')
      .reduce((sum, a) => sum + a.minutes, 0);

  const totalUsedMinutes =
    screenTime.studyUsedMinutes + screenTime.entertainmentUsedMinutes + systemMinutes;

  const remainingEntertainment = Math.max(
    0,
    screenTime.entertainmentLimitMinutes - screenTime.entertainmentUsedMinutes
  );

  const studyPercent = Math.min(
    100,
    Math.round((screenTime.studyUsedMinutes / Math.max(1, totalUsedMinutes)) * 100)
  );

  const policies = data?.policies || {
    curfewStart: '22:00',
    curfewEnd: '06:00',
    safeSearch: true,
    blockAdultGambling: true,
    blockSocialStudyHours: true,
    whitelistProtected: ['chinhphu.vn', '111.vn', '.edu.vn'],
  };

  const pendingRequestsList = (data?.requestsHistory || []).filter(
    (r) => r.status === 'PENDING'
  );
  const otpCode = String(data?.pairing?.otpCode || '824913').padStart(6, '0');
  const maxWeeklyMinutes = Math.max(
    120,
    ...(data?.weeklyUsage || []).map((d) => d.minutes)
  );

  // Biểu đồ
  const overviewGaugeData = {
    labels: ['Đã giải trí', 'Còn lại'],
    datasets: [
      {
        data: [screenTime.entertainmentUsedMinutes, remainingEntertainment],
        backgroundColor: ['#2563eb', '#f1f5f9'],
        borderWidth: 0,
        cutout: '76%',
      },
    ],
  };

  const donutChartData = {
    labels: ['Học tập (Study)', 'Giải trí (Entertainment)', 'Hệ thống (System)'],
    datasets: [
      {
        data: [
          screenTime.studyUsedMinutes,
          screenTime.entertainmentUsedMinutes,
          systemMinutes,
        ],
        backgroundColor: ['#10b981', '#f59e0b', '#94a3b8'],
        borderWidth: 2,
      },
    ],
  };

  const barChartData = {
    labels: (data?.appUsageTop || []).map((app) => app.name),
    datasets: [
      {
        label: 'Thời lượng sử dụng (phút)',
        data: (data?.appUsageTop || []).map((app) => app.minutes),
        backgroundColor: (data?.appUsageTop || []).map((app) =>
          app.category === 'STUDY'
            ? '#3b82f6'
            : app.category === 'ENTERTAINMENT'
            ? '#f59e0b'
            : '#94a3b8'
        ),
        borderRadius: 8,
      },
    ],
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.openguard_' + Date.now();
    localStorage.setItem('access_token', token);
    setAccessToken(token);
    onUpdateParentEmail(emailInput);
    setActiveRoute('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setAccessToken('');
    setActiveRoute('/login');
    setMobileMenuOpen(false);
  };

  // Xử lý Duyệt yêu cầu kèm lý do của Phụ huynh
  const triggerApproveWithReason = (reqId) => {
    const typedReason = (replyInputs[reqId] || '').trim();
    const finalReply = typedReason || 'Bố/Mẹ đồng ý yêu cầu của con.';
    onApproveRequest(reqId, finalReply);
    setReplyInputs((prev) => ({ ...prev, [reqId]: '' }));
  };

  // Xử lý Từ chối yêu cầu kèm lý do của Phụ huynh
  const triggerRejectWithReason = (reqId) => {
    const typedReason = (replyInputs[reqId] || '').trim();
    const finalReply = typedReason || 'Hôm nay đã muộn, mai con tiếp tục nhé.';
    onRejectRequest(reqId, finalReply);
    setReplyInputs((prev) => ({ ...prev, [reqId]: '' }));
  };

  // Lưu chỉnh sửa lý do phản hồi cho yêu cầu đã xử lý
  const handleSaveEditedReply = (e, reqId) => {
    e.preventDefault();
    if (!editingReplyText.trim()) return;
    if (onUpdateRequestReply) {
      onUpdateRequestReply(reqId, editingReplyText.trim());
    }
    setEditingReplyReqId(null);
    setEditingReplyText('');
  };

  // Thêm tên miền tùy chỉnh kèm lý do Chặn / Cho phép
  const handleSubmitDomain = (e) => {
    e.preventDefault();
    const defaultReason =
      customAction === 'BLOCKED'
        ? 'Phụ huynh chặn để đảm bảo an toàn và tập trung học tập'
        : 'Phụ huynh cho phép truy cập phục vụ học tập & giải trí lành mạnh';

    const finalReason = customReason.trim() || defaultReason;
    const result = onAddCustomDomain(customDomain, customAction, finalReason);

    if (result) {
      setPolicyMessage(result);
      if (result.type === 'success') {
        setCustomDomain('');
        setCustomReason('');
      }
    }
  };

  // Lưu lý do mới cho Danh mục lọc web
  const handleSaveCategoryReason = (e, cat) => {
    if (e) e.preventDefault();
    const reasonToSave =
      editingCatReason.trim() ||
      cat.reason ||
      'Bảo vệ an toàn trên không gian mạng';
    onUpdateWebCategory(cat.id, cat.status, reasonToSave);
    setEditingCatId(null);
    setEditingCatReason('');
    setPolicyMessage({
      type: 'success',
      text: `Đã cập nhật lý do cho danh mục "${cat.name}": "${reasonToSave}"`,
    });
  };

  // Đổi trạng thái Chặn / Hạn chế / Cho phép của Danh mục (nếu đang mở ô nhập lý do thì lấy luôn lý do đang nhập)
  const handleSelectCategoryStatus = (cat, newStatus) => {
    const reasonToUse =
      editingCatId === cat.id && editingCatReason.trim()
        ? editingCatReason.trim()
        : cat.reason || 'Bảo vệ an toàn trên không gian mạng';
    onUpdateWebCategory(cat.id, newStatus, reasonToUse);
    if (editingCatId === cat.id) {
      setEditingCatId(null);
      setEditingCatReason('');
    }
  };

  // Lưu lý do mới cho Tên miền trong bảng DNS
  const handleSaveDomainReason = (e, item) => {
    if (e) e.preventDefault();
    const reasonToSave =
      editingDomainReason.trim() ||
      item.reason ||
      'Chính sách tùy chỉnh của Phụ huynh';

    if (onUpdateDnsRule) {
      onUpdateDnsRule(item.domain, item.action, reasonToSave);
    } else {
      onAddCustomDomain(item.domain, item.action, reasonToSave);
    }
    setEditingDomainKey(null);
    setEditingDomainReason('');
    setPolicyMessage({
      type: 'success',
      text: `Đã lưu lý do mới cho tên miền "${item.domain}": "${reasonToSave}"`,
    });
  };

  // Đổi nhanh trạng thái Chặn <-> Cho phép của 1 tên miền (ưu tiên lấy lý do đang gõ nếu có)
  const handleToggleDomainAction = (item) => {
    const nextAction = item.action === 'BLOCKED' ? 'ALLOWED' : 'BLOCKED';
    const typedReason =
      editingDomainKey === item.domain ? editingDomainReason.trim() : '';

    const nextReason =
      typedReason ||
      (nextAction === 'ALLOWED'
        ? `Phụ huynh đã cho phép truy cập (${item.reason || 'An toàn'})`
        : `Phụ huynh đã chặn (${item.reason || 'Hạn chế truy cập'})`);

    if (onUpdateDnsRule) {
      onUpdateDnsRule(item.domain, nextAction, nextReason);
    } else {
      onAddCustomDomain(item.domain, nextAction, nextReason);
    }
    setEditingDomainKey(null);
    setEditingDomainReason('');
  };

  const handleSelectRoute = (route) => {
    setActiveRoute(route);
    setMobileMenuOpen(false);
  };

  const navItems = [
    {
      section: 'CHÍNH',
      items: [
        {
          route: '/dashboard',
          label: 'Tổng quan',
          sub: 'Thời gian & thiết bị',
          icon: LayoutDashboard,
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-50',
        },
        {
          route: '/requests',
          label: 'Yêu cầu từ con',
          sub: 'Xin thêm giờ & mở web',
          icon: MessageSquare,
          iconColor: 'text-rose-600',
          iconBg: 'bg-rose-50',
          badge: pendingRequestsList.length,
        },
        {
          route: '/activity',
          label: 'Báo cáo & Biểu đồ',
          sub: 'Thống kê sử dụng',
          icon: BarChart3,
          iconColor: 'text-purple-600',
          iconBg: 'bg-purple-50',
        },
      ],
    },
    {
      section: 'QUẢN LÝ & LỌC WEB',
      items: [
        {
          route: '/policies',
          label: 'Lọc web & Khung giờ',
          sub: 'Danh mục, tên miền & lý do',
          icon: Sliders,
          iconColor: 'text-amber-600',
          iconBg: 'bg-amber-50',
        },
        {
          route: '/logs',
          label: 'Nhật ký thay đổi',
          sub: 'Lịch sử cập nhật luật',
          icon: History,
          iconColor: 'text-teal-600',
          iconBg: 'bg-teal-50',
        },
      ],
    },
    {
      section: 'CÔNG CỤ & HỆ THỐNG',
      items: [
        {
          route: '/devices/pair',
          label: 'Kết nối thiết bị',
          sub: 'Mã ghép nối máy mới',
          icon: Link2,
          iconColor: 'text-emerald-600',
          iconBg: 'bg-emerald-50',
        },
        {
          route: '/login',
          label: 'Tài khoản & Bảo mật',
          sub: 'Đăng nhập & Token',
          icon: LogIn,
          iconColor: 'text-indigo-600',
          iconBg: 'bg-indigo-50',
        },
      ],
    },
  ];

  // 4 tab chính + 1 nút Menu trên thanh điều hướng đáy (Bottom Navigation) của Điện thoại
  const mobileBottomTabs = [
    {
      route: '/dashboard',
      label: 'Tổng quan',
      icon: LayoutDashboard,
      activeColor: 'text-blue-600',
    },
    {
      route: '/requests',
      label: 'Yêu cầu',
      icon: MessageSquare,
      activeColor: 'text-rose-600',
      badge: pendingRequestsList.length,
    },
    {
      route: '/activity',
      label: 'Báo cáo',
      icon: BarChart3,
      activeColor: 'text-purple-600',
    },
    {
      route: '/policies',
      label: 'Lọc web',
      icon: Sliders,
      activeColor: 'text-amber-600',
    },
  ];

  // Hàm render toàn bộ 7 trang chức năng
  const renderMainPages = (isMobileView = false) => (
    <main
      className={`${
        isMobileView
          ? 'p-4 pb-24 space-y-4'
          : 'p-4 md:p-6 pb-24 md:pb-6 max-w-7xl w-full mx-auto space-y-6'
      }`}
    >
      {/* 1. TRANG TỔNG QUAN (/dashboard) */}
      {activeRoute === '/dashboard' && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className={`${isMobileView ? 'text-lg' : 'text-xl md:text-2xl'} font-bold text-slate-900`}>
                Trang tổng quan — {data?.child?.name}
              </h2>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Thiết bị <strong>{data?.child?.device?.name}</strong> đang{' '}
                {data?.child?.device?.isOnline ? 'hoạt động công khai' : 'ngoại tuyến'}.
              </p>
            </div>
            <button
              onClick={() => handleSelectRoute('/policies')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-600" /> Quản lý Chặn / Cho phép web
            </button>
          </div>

          {/* Banner khi có yêu cầu chờ duyệt (ĐÃ THÊM Ô NHẬP LÝ DO TRỰC TIẾP) */}
          {data?.child?.pendingRequest && (
            <div className="bg-white border border-rose-200 rounded-2xl p-4 space-y-3 shadow-2xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">
                      Yêu cầu mới từ con
                    </span>
                    <span className="text-xs text-slate-400">
                      {data.child.pendingRequest.createdAt}
                    </span>
                  </div>
                  <p className="font-bold text-slate-800 text-sm mt-1">
                    {data.child.name} ({data.child.pendingRequest.title || data.child.pendingRequest.value}):{' '}
                    <span className="font-normal text-slate-600 italic">
                      "{data.child.pendingRequest.reason}"
                    </span>
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-rose-100 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={replyInputs[data.child.pendingRequest.id] || ''}
                  onChange={(e) =>
                    setReplyInputs((prev) => ({
                      ...prev,
                      [data.child.pendingRequest.id]: e.target.value,
                    }))
                  }
                  placeholder="Nhập lý do duyệt hoặc từ chối gửi cho con (VD: Mẹ cho thêm 15p để nộp bài nhé)..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => triggerApproveWithReason(data.child.pendingRequest.id)}
                    className="flex-1 sm:flex-initial px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Duyệt yêu cầu
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerRejectWithReason(data.child.pendingRequest.id)}
                    className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HÀNG 3 THẺ TỔNG QUAN */}
          <div className={`grid grid-cols-1 ${isMobileView ? 'gap-4' : 'lg:grid-cols-3 gap-6'}`}>
            {/* Thẻ 1: Thời gian giải trí */}
            <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">
                      Thời gian giải trí
                    </h3>
                    <p className="text-xs text-slate-400">Giới hạn mỗi ngày</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  Còn {remainingEntertainment}p
                </span>
              </div>

              <div className="relative w-36 h-36 md:w-40 md:h-40 mx-auto my-4 flex items-center justify-center">
                <Doughnut
                  data={overviewGaugeData}
                  options={{ plugins: { legend: { display: false } } }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-extrabold text-blue-600">
                    {screenTime.entertainmentUsedMinutes}p
                  </span>
                  <span className="text-[11px] text-slate-400">
                    / {screenTime.entertainmentLimitMinutes} phút
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Trạng thái sử dụng</span>
                <span className="font-bold text-blue-600">
                  {remainingEntertainment > 0 ? 'Trong giới hạn' : 'Đã hết giờ'}
                </span>
              </div>
            </div>

            {/* Thẻ 2: Thời gian học tập */}
            <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">
                    Thời gian học tập & Dùng máy
                  </h3>
                  <p className="text-xs text-slate-400">Tiến độ hoạt động hôm nay</p>
                </div>
              </div>

              <div className="my-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {screenTime.studyUsedMinutes}p
                  </span>
                  <span className="text-xs text-slate-400">
                    / {totalUsedMinutes} phút tổng cộng
                  </span>
                </div>

                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden mt-3 p-0.5">
                  <div
                    className="h-full bg-emerald-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center transition-all duration-300"
                    style={{ width: `${Math.max(12, studyPercent)}%` }}
                  >
                    {studyPercent}%
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Học tập (Không giới hạn)</span>
                  <span className="font-bold text-emerald-600">
                    {screenTime.studyUsedMinutes} phút
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Giải trí đã dùng</span>
                  <span className="font-bold text-amber-600">
                    {screenTime.entertainmentUsedMinutes} phút
                  </span>
                </div>
              </div>
            </div>

            {/* Thẻ 3: Trạng thái thiết bị */}
            <div className="bg-slate-50/90 rounded-2xl p-5 md:p-6 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">
                      Thiết bị đang kết nối
                    </h3>
                    <p className="text-xs text-slate-400">{data?.child?.name}</p>
                  </div>
                </div>
                <button
                  onClick={onToggleDeviceOnline}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Đổi trạng thái
                </button>
              </div>

              <div className="my-4 p-4 rounded-xl bg-white border border-slate-200/80">
                <div className="text-xs text-slate-400">Tên máy tính của con</div>
                <div className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                  {data?.child?.device?.name}
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      data?.child?.device?.isOnline ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  <span
                    className={
                      data?.child?.device?.isOnline
                        ? 'text-emerald-700'
                        : 'text-rose-600'
                    }
                  >
                    {data?.child?.device?.isOnline
                      ? `Đang trực tuyến (${data?.child?.device?.lastSeen})`
                      : `Ngoại tuyến (${data?.child?.device?.lastSeen})`}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Giờ giới nghiêm ban đêm</span>
                <span className="font-bold text-slate-800">
                  {policies.curfewStart} – {policies.curfewEnd}
                </span>
              </div>
            </div>
          </div>

          {/* HÀNG DƯỚI: BIỂU ĐỒ TUẦN & KHUNG GIỜ ĐƯỢC PHÉP */}
          <div className={`grid grid-cols-1 ${isMobileView ? 'gap-4' : 'lg:grid-cols-12 gap-6'}`}>
            <div className={`${isMobileView ? '' : 'lg:col-span-7'} bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-2xs`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
                    Thời gian dùng máy trong tuần
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tổng hợp số phút sử dụng qua các ngày
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  7 ngày
                </span>
              </div>

              <div className="h-40 md:h-44 flex items-end justify-between gap-2 md:gap-3 pt-4 px-1">
                {(data?.weeklyUsage || []).map((item, idx) => {
                  const heightPercent = Math.round(
                    (item.minutes / maxWeeklyMinutes) * 100
                  );
                  const isWeekend = item.day === 'T7' || item.day === 'CN';
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-1.5"
                    >
                      <span className="text-[10px] md:text-[11px] font-semibold text-slate-500">
                        {item.minutes}p
                      </span>
                      <div className="w-full max-w-[36px] h-24 md:h-28 bg-slate-100 rounded-xl flex items-end overflow-hidden p-0.5">
                        <div
                          className={`w-full rounded-lg transition-all duration-300 ${
                            isWeekend ? 'bg-amber-400' : 'bg-teal-600'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`${isMobileView ? '' : 'lg:col-span-5'} bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-2xs space-y-3`}>
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-3">
                Khung giờ được phép hôm nay
              </h3>
              {(data?.allowedSchedules || []).map((sched) => (
                <div
                  key={sched.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        sched.category === 'STUDY'
                          ? 'bg-emerald-50 text-emerald-600'
                          : sched.category === 'ENTERTAINMENT'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-purple-50 text-purple-600'
                      }`}
                    >
                      {sched.category === 'STUDY' ? (
                        <BookOpen className="w-4 h-4" />
                      ) : sched.category === 'ENTERTAINMENT' ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <Laptop className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800">
                        {sched.title}
                      </div>
                      <div className="text-xs text-slate-400">{sched.timeRange}</div>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      sched.status === 'Đang mở'
                        ? 'bg-emerald-50 text-emerald-700'
                        : sched.status === 'Sắp hết'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {sched.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 2. TRANG YÊU CẦU TỪ CON (/requests) */}
      {activeRoute === '/requests' && (
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-2xs space-y-5">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900">Yêu cầu từ con</h2>
            <p className="text-xs text-slate-500 mt-1">
              Con có thể xin thêm giờ hoặc xin mở một trang web kèm lý do. Bạn có thể ghi lại lời nhắn / lý do trước khi bấm Duyệt hoặc Từ chối (hoặc sửa lại lý do bất kỳ lúc nào).
            </p>
          </div>

          <div className="space-y-3">
            {(data?.requestsHistory || []).map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        req.type === 'TIME_EXTENSION'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {req.type === 'TIME_EXTENSION' ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <Globe className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">
                        {req.title}
                      </div>
                      <div className="text-sm text-slate-600 italic mt-0.5">
                        "{req.reason}"
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {data?.child?.name} • {req.createdAt}
                      </div>
                      {req.parentReply && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <div className="text-xs text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
                            💬 Lý do phản hồi của Bố/Mẹ: <strong>"{req.parentReply}"</strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReplyReqId(req.id);
                              setEditingReplyText(req.parentReply);
                            }}
                            className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" /> Sửa lý do
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {req.status === 'APPROVED' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã duyệt
                      </span>
                    )}
                    {req.status === 'REJECTED' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" /> Đã từ chối
                      </span>
                    )}
                  </div>
                </div>

                {/* Form sửa lại lý do phản hồi cho yêu cầu đã duyệt/từ chối */}
                {editingReplyReqId === req.id && (
                  <form
                    onSubmit={(e) => handleSaveEditedReply(e, req.id)}
                    className="pt-2 border-t border-slate-200/70 flex flex-wrap gap-2"
                  >
                    <input
                      type="text"
                      value={editingReplyText}
                      onChange={(e) => setEditingReplyText(e.target.value)}
                      placeholder="Nhập lý do phản hồi mới..."
                      className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg border border-blue-300 bg-white text-xs"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold cursor-pointer"
                    >
                      Lưu lý do
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingReplyReqId(null)}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Hủy
                    </button>
                  </form>
                )}

                {/* Nếu đang chờ duyệt: Hiển thị ô nhập lý do phản hồi cho Phụ huynh */}
                {req.status === 'PENDING' && (
                  <div className="pt-3 border-t border-slate-200/70 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={replyInputs[req.id] || ''}
                      onChange={(e) =>
                        setReplyInputs((prev) => ({ ...prev, [req.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          triggerApproveWithReason(req.id);
                        }
                      }}
                      placeholder="Nhập lý do đồng ý hoặc từ chối để con hiểu (VD: Mẹ mở cho con 30p làm bài nhé)..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => triggerApproveWithReason(req.id)}
                        className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                      >
                        Duyệt
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerRejectWithReason(req.id)}
                        className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TRANG BÁO CÁO & BIỂU ĐỒ (/activity) */}
      {activeRoute === '/activity' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-2xs">
            <h2 className="text-lg md:text-xl font-bold text-slate-900">
              Báo cáo Hoạt động & Biểu đồ Tổng quan
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Chỉ thống kê tên ứng dụng, tên miền và thời lượng sử dụng; tôn trọng quyền riêng tư của con.
            </p>

            <div className={`grid grid-cols-1 ${isMobileView ? 'gap-6' : 'md:grid-cols-2 gap-6'} mt-6 items-center`}>
              <div className="max-w-[220px] mx-auto">
                <Doughnut data={donutChartData} />
              </div>
              <div>
                <Bar
                  data={barChartData}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-2xs">
            <h3 className="font-bold text-base text-slate-900 mb-4">
              Lịch sử Lọc mạng DNS (Kèm lý do Chặn / Cho phép)
            </h3>

            {/* Giao diện Thẻ DNS trên Điện thoại */}
            <div className={`${isMobileView ? 'block' : 'block md:hidden'} space-y-3`}>
              {(data?.dnsRecentEvents || []).map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{item.domain}</span>
                    {item.action === 'BLOCKED' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                        Đã chặn
                      </span>
                    )}
                    {item.action === 'SAFESEARCH' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        SafeSearch
                      </span>
                    )}
                    {item.action === 'ALLOWED' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Cho phép
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600">
                    <strong>Lý do:</strong> {item.reason}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                    <span>Bởi: {item.ruleBy || data?.parent?.name}</span>
                    <span className="font-mono">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Giao diện Bảng DNS trên Máy tính */}
            {!isMobileView && (
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-slate-400 uppercase bg-slate-50">
                      <th className="py-3 px-4 rounded-tl-lg">Thời gian</th>
                      <th className="py-3 px-4">Tên miền</th>
                      <th className="py-3 px-4">Lý do Chặn / Cho phép</th>
                      <th className="py-3 px-4">Người đặt luật</th>
                      <th className="py-3 px-4 rounded-tr-lg">Hành vi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data?.dnsRecentEvents || []).map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-xs text-slate-500">
                          {item.time}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {item.domain}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{item.reason}</td>
                        <td className="py-3 px-4 text-xs text-slate-500">
                          {item.ruleBy || data?.parent?.name}
                        </td>
                        <td className="py-3 px-4">
                          {item.action === 'BLOCKED' && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                              Đã chặn
                            </span>
                          )}
                          {item.action === 'SAFESEARCH' && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              SafeSearch
                            </span>
                          )}
                          {item.action === 'ALLOWED' && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Cho phép
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. TRANG LỌC WEB & KHUNG GIỜ (/policies) */}
      {activeRoute === '/policies' && (
        <div className="space-y-5">
          {/* Khối 1: Lọc web theo danh mục kèm Lý do giải thích cho con */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-2xs space-y-5">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900">
                Lọc web theo danh mục & Lý do giải thích
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Mỗi danh mục đều đính kèm lý do rõ ràng để hiển thị trên máy của con khi con thắc mắc.
              </p>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {(data?.webCategories || []).map((cat) => (
                <div
                  key={cat.id}
                  className="p-4 bg-white hover:bg-slate-50/80 space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-sm text-slate-800">
                        {cat.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>
                          Lý do hiển thị cho con:{' '}
                          <strong className="text-slate-700">
                            "{cat.reason || 'Bảo vệ an toàn trên không gian mạng'}"
                          </strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCatId(cat.id);
                            setEditingCatReason(
                              cat.reason || 'Bảo vệ an toàn trên không gian mạng'
                            );
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" /> Sửa lý do
                        </button>
                      </div>
                    </div>

                    <div className="inline-flex rounded-xl bg-slate-100 p-1 gap-1 w-full sm:w-auto shrink-0">
                      {[
                        { code: 'BLOCK', label: 'Chặn', activeClass: 'bg-rose-600 text-white' },
                        { code: 'LIMIT', label: 'Hạn chế', activeClass: 'bg-amber-500 text-white' },
                        { code: 'ALLOW', label: 'Cho phép', activeClass: 'bg-emerald-600 text-white' },
                      ].map((btn) => (
                        <button
                          key={btn.code}
                          type="button"
                          onClick={() => handleSelectCategoryStatus(cat, btn.code)}
                          className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            cat.status === btn.code
                              ? btn.activeClass
                              : 'text-slate-600 hover:bg-white'
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form sửa lý do trực tiếp của danh mục (Hỗ trợ cả bấm nút Lưu và phím Enter) */}
                  {editingCatId === cat.id && (
                    <form
                      onSubmit={(e) => handleSaveCategoryReason(e, cat)}
                      className="flex flex-wrap gap-2 pt-2"
                    >
                      <input
                        type="text"
                        value={editingCatReason}
                        onChange={(e) => setEditingCatReason(e.target.value)}
                        placeholder="Nhập lý do giải thích cho con..."
                        className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg border border-blue-300 bg-blue-50/30 text-xs"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Lưu lý do
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCatId(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold cursor-pointer"
                      >
                        Hủy
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-sm text-slate-800">
                  SafeSearch & YouTube Hạn chế
                </div>
                <div className="text-xs text-slate-500">
                  Khi một trang bị chặn, con thấy trang giải thích lý do mang tính giáo dục.
                </div>
              </div>
              <input
                type="checkbox"
                checked={Boolean(policies.safeSearch)}
                onChange={() =>
                  onUpdatePolicyField(
                    'safeSearch',
                    !policies.safeSearch,
                    `${!policies.safeSearch ? 'Bật' : 'Tắt'} chế độ SafeSearch & YouTube Hạn chế`
                  )
                }
                className="w-5 h-5 accent-blue-600 cursor-pointer shrink-0"
              />
            </div>
          </div>

          {/* Khối 2: Thêm & Quản lý Tên miền Chặn / Cho phép kèm Lý do */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-2xs space-y-5">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Thêm tên miền Chặn hoặc Cho phép (Kèm lý do cho con)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Khi bạn thêm trang web vào danh sách Chặn hoặc Cho phép, lý do bạn nhập sẽ đồng bộ sang mục "Web Chặn & Cho phép" bên máy của con.
              </p>
            </div>

            <form onSubmit={handleSubmitDomain} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Tên miền trang web
                  </label>
                  <input
                    type="text"
                    placeholder="VD: gamevui.vn, scratch.mit.edu..."
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Hành động áp dụng
                  </label>
                  <select
                    value={customAction}
                    onChange={(e) => setCustomAction(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
                  >
                    <option value="BLOCKED">🚫 Chặn trang web này</option>
                    <option value="ALLOWED">✅ Cho phép trang web này</option>
                  </select>
                </div>

                <div className="sm:col-span-3 flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Lưu quy tắc
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Lý do {customAction === 'BLOCKED' ? 'chặn' : 'cho phép'} (hiển thị minh bạch trên máy của con)
                </label>
                <input
                  type="text"
                  placeholder={
                    customAction === 'BLOCKED'
                      ? 'Nhập lý do chặn (VD: Tránh xao nhãng trong giờ học bài)...'
                      : 'Nhập lý do cho phép (VD: Trang học lập trình cô giáo giao)...'
                  }
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm"
                />

                {/* Hàng nút gợi ý lý do nhanh */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-400 font-semibold">
                    Gợi ý nhanh:
                  </span>
                  {quickReasons.map((sample, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => setCustomReason(sample)}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition cursor-pointer"
                    >
                      + {sample}
                    </button>
                  ))}
                </div>
              </div>
            </form>

            {policyMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  policyMessage.type === 'error'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {policyMessage.text}
              </div>
            )}

            {/* Danh sách các tên miền đang Chặn / Cho phép để Phụ huynh sửa lý do hoặc đổi trạng thái */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase text-slate-400">
                Danh sách tên miền đang áp dụng ({(data?.dnsRecentEvents || []).length})
              </div>
              <div className="space-y-2">
                {(data?.dnsRecentEvents || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {item.domain}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.action === 'BLOCKED'
                              ? 'bg-rose-100 text-rose-700'
                              : item.action === 'SAFESEARCH'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {item.action === 'BLOCKED'
                            ? 'Đang chặn'
                            : item.action === 'SAFESEARCH'
                            ? 'SafeSearch'
                            : 'Đang cho phép'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDomainKey(item.domain);
                            setEditingDomainReason(item.reason || '');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3 text-blue-600" /> Sửa lý do
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleDomainAction(item)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                            item.action === 'BLOCKED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {item.action === 'BLOCKED' ? 'Đổi sang Cho phép' : 'Đổi sang Chặn'}
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600">
                      <span className="text-slate-400">Lý do: </span>
                      <strong>{item.reason}</strong>
                      <span className="text-slate-400"> • Người đặt: {item.ruleBy || data?.parent?.name}</span>
                    </div>

                    {editingDomainKey === item.domain && (
                      <form
                        onSubmit={(e) => handleSaveDomainReason(e, item)}
                        className="flex flex-wrap gap-2 pt-1"
                      >
                        <input
                          type="text"
                          value={editingDomainReason}
                          onChange={(e) => setEditingDomainReason(e.target.value)}
                          placeholder="Nhập lý do mới..."
                          className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg border border-blue-300 bg-white text-xs"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold cursor-pointer"
                        >
                          Lưu lý do
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingDomainKey(null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                        >
                          Hủy
                        </button>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Các cổng thông tin trường học và tổng đài bảo vệ trẻ em (
                {(policies.whitelistProtected || ['chinhphu.vn', '111.vn', '.edu.vn']).join(', ')}
                ) luôn được miễn trừ chặn vĩnh viễn.
              </span>
            </div>
          </div>

          {/* Khối 3: Giới hạn thời gian & Giờ giới nghiêm */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-2xs space-y-5">
            <h3 className="font-bold text-base text-slate-900">
              Giới hạn thời gian & Giờ giới nghiêm
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-700">
                  Giới hạn giải trí hàng ngày
                </span>
                <span className="text-sm font-extrabold text-blue-600">
                  {screenTime.entertainmentLimitMinutes} phút
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="180"
                step="5"
                value={screenTime.entertainmentLimitMinutes}
                onChange={(e) => onUpdateEntertainmentLimit(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-xs text-slate-500 font-semibold mb-1">
                  Giờ giới nghiêm — Bắt đầu lúc
                </label>
                <input
                  type="time"
                  value={policies.curfewStart}
                  onChange={(e) =>
                    onUpdatePolicyField(
                      'curfewStart',
                      e.target.value,
                      `Đổi giờ bắt đầu giới nghiêm thành ${e.target.value}`
                    )
                  }
                  className="w-full font-bold text-base text-slate-800 bg-transparent outline-none"
                />
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-xs text-slate-500 font-semibold mb-1">
                  Kết thúc lúc (sáng hôm sau)
                </label>
                <input
                  type="time"
                  value={policies.curfewEnd}
                  onChange={(e) =>
                    onUpdatePolicyField(
                      'curfewEnd',
                      e.target.value,
                      `Đổi giờ kết thúc giới nghiêm thành ${e.target.value}`
                    )
                  }
                  className="w-full font-bold text-base text-slate-800 bg-transparent outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TRANG NHẬT KÝ THAY ĐỔI LUẬT (/logs) */}
      {activeRoute === '/logs' && (
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900">
              Nhật ký thay đổi chính sách
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Mọi thay đổi về khung giờ, danh mục lọc web và lý do chặn/mở đều được hiển thị minh bạch cho cả phụ huynh và trẻ cùng xem.
            </p>
          </div>
          <div className="space-y-2.5">
            {(data?.policyChangeLogs || []).map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-800">
                      {log.action}
                    </div>
                    <div className="text-xs text-slate-400">
                      Thực hiện bởi: {log.actor}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400 pl-11 sm:pl-0">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TRANG KẾT NỐI THIẾT BỊ MỚI (/devices/pair) */}
      {activeRoute === '/devices/pair' && (
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-2xs text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Link2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Kết nối Thiết bị mới
          </h2>
          <p className="text-xs text-slate-500">
            Hãy nhập mã gồm 6 chữ số bên dưới vào ứng dụng trên máy tính của{' '}
            <strong>{data?.child?.name}</strong>.
          </p>

          <div className="py-4 px-4 bg-slate-50 rounded-2xl border border-slate-200 text-2xl md:text-3xl font-extrabold tracking-widest text-blue-600 font-mono">
            {otpCode.slice(0, 3).split('').join(' ')} -{' '}
            {otpCode.slice(3, 6).split('').join(' ')}
          </div>

          <p className="text-xs font-semibold text-amber-600">
            ⏱ Mã có hiệu lực trong: {formatCountdown(countdown)}
          </p>

          <button
            onClick={onGenerateOtp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Tạo mã kết nối mới
          </button>
        </div>
      )}

      {/* 7. TRANG TÀI KHOẢN & ĐĂNG NHẬP (/login) */}
      {activeRoute === '/login' && (
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-2xs max-w-md mx-auto">
          <div className="flex gap-2 mb-5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer ${
                authMode === 'login' ? 'bg-white shadow-2xs text-slate-800' : 'text-slate-500'
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer ${
                authMode === 'register' ? 'bg-white shadow-2xs text-slate-800' : 'text-slate-500'
              }`}
            >
              Đăng ký
            </button>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Email Phụ huynh ({data?.parent?.name})
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                value={passwordInput}
                placeholder="Nhập mật khẩu..."
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition cursor-pointer"
            >
              {authMode === 'login' ? 'Đăng nhập & Lưu Token' : 'Tạo tài khoản Phụ huynh'}
            </button>
          </form>

          {accessToken && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1.5">
              <p className="font-bold text-emerald-800">
                Đã lưu access_token vào localStorage:
              </p>
              <code className="block truncate bg-white p-2 rounded border border-emerald-100 text-slate-600">
                {accessToken}
              </code>
            </div>
          )}
        </div>
      )}
    </main>
  );

  // Menu Ngăn kéo (Slide-over Drawer) khi bấm nút 3 gạch trên Điện thoại
  const renderMobileDrawer = () =>
    mobileMenuOpen && (
      <div className="fixed inset-0 z-50 flex">
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
        <div className="relative w-72 max-w-[82vw] bg-white h-full shadow-2xl flex flex-col justify-between z-10 overflow-y-auto">
          <div>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                  {getInitials(data?.parent?.name)}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">
                    {data?.parent?.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {data?.parent?.email}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 space-y-4">
              {navItems.map((group, gIdx) => (
                <div key={gIdx}>
                  <div className="px-3 mb-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                    {group.section}
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeRoute === item.route;
                      return (
                        <button
                          key={item.route}
                          onClick={() => handleSelectRoute(item.route)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition cursor-pointer ${
                            isActive
                              ? 'bg-slate-100 text-slate-900 font-semibold'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold">{item.label}</div>
                              <div className="text-[10px] text-slate-400">{item.sub}</div>
                            </div>
                          </div>
                          {item.badge > 0 && (
                            <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 space-y-2.5 bg-slate-50/60">
            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    data?.child?.device?.isOnline ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                {data?.child?.device?.name} ({data?.child?.name})
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Hoạt động: {data?.child?.device?.lastSeen}
              </div>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSwitchToAgent();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-teal-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Mở Máy của Trẻ (Agent)
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-2 px-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Đăng xuất
            </button>
          </div>
        </div>
      </div>
    );

  // NẾU BẬT NÚT "📱 Giao diện Điện thoại"
  if (simulateMobile) {
    return (
      <div className="min-h-screen bg-slate-900 py-6 px-4 flex flex-col items-center justify-start font-sans select-none">
        <div className="mb-4 bg-slate-800 border border-slate-700 rounded-full px-4 py-1.5 flex items-center gap-3 text-white text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
            <Smartphone className="w-4 h-4" /> Đang xem Giao diện Điện thoại (390 × 844)
          </span>
          <button
            onClick={() => setSimulateMobile(false)}
            className="px-3 py-1 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-100 transition cursor-pointer flex items-center gap-1"
          >
            <Monitor className="w-3.5 h-3.5 text-blue-600" /> Quay về Bản Máy tính
          </button>
        </div>

        <div className="w-full max-w-[395px] h-[812px] bg-[#f8fafc] rounded-[42px] border-[10px] border-slate-800 shadow-2xl overflow-hidden flex flex-col relative">
          <div className="h-7 bg-white px-6 flex items-center justify-between text-[11px] font-bold text-slate-800 shrink-0">
            <span>09:41</span>
            <div className="w-20 h-4 bg-slate-900 rounded-full" />
            <span>5G • 100%</span>
          </div>

          <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-xl bg-slate-100 text-slate-700 cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <div className="font-bold text-sm text-slate-900 leading-tight">
                  OpenGuard Kids
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {data?.child?.device?.name} • Online
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleSelectRoute('/requests')}
                className="relative p-2 rounded-xl bg-amber-50 text-amber-600 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {pendingRequestsList.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {pendingRequestsList.length}
                  </span>
                )}
              </button>
              <button
                onClick={onSwitchToAgent}
                className="px-2.5 py-1.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 text-[11px] font-bold cursor-pointer"
              >
                Máy con
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            {renderMainPages(true)}
          </div>

          <nav className="h-16 bg-white border-t border-slate-200 px-2 flex items-center justify-around shrink-0 z-20">
            {mobileBottomTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeRoute === tab.route;
              return (
                <button
                  key={tab.route}
                  onClick={() => handleSelectRoute(tab.route)}
                  className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 relative cursor-pointer ${
                    isActive ? tab.activeColor : 'text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-bold">{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="absolute top-1 right-4 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex-1 py-1.5 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
              <span className="text-[10px] font-bold">Menu</span>
            </button>
          </nav>

          {renderMobileDrawer()}
        </div>
      </div>
    );
  }

  // GIAO DIỆN MẶC ĐỊNH
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex font-sans">
      <aside
        className={`hidden md:flex ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } bg-white border-r border-slate-200 flex-col justify-between transition-all duration-200 shrink-0 select-none`}
      >
        <div>
          <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <div className="font-bold text-sm text-slate-900 leading-tight truncate">
                  OpenGuard Kids
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Người Bạn Đồng Hành
                </div>
              </div>
            )}
          </div>

          <div className="p-3 space-y-5">
            {navItems.map((group, gIdx) => (
              <div key={gIdx}>
                {!sidebarCollapsed && (
                  <div className="px-3 mb-2 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                    {group.section}
                  </div>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeRoute === item.route;
                    return (
                      <button
                        key={item.route}
                        onClick={() => handleSelectRoute(item.route)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition cursor-pointer relative ${
                          isActive
                            ? 'bg-slate-100 text-slate-900 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r" />
                        )}
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          {!sidebarCollapsed && (
                            <div className="overflow-hidden">
                              <div className="text-xs font-bold leading-snug truncate">
                                {item.label}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {item.sub}
                              </div>
                            </div>
                          )}
                        </div>
                        {!sidebarCollapsed && item.badge > 0 && (
                          <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {!sidebarCollapsed && (
          <div className="p-4 m-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  data?.child?.device?.isOnline ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              {data?.child?.device?.name}
            </div>
            <div>Hồ sơ: {data?.child?.name}</div>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-3 sticky top-0 z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              title="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex w-7 h-7 rounded-full border border-slate-200 items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer"
              title="Thu gọn / Mở rộng menu"
            >
              <ChevronLeft
                className={`w-4 h-4 transition-transform ${
                  sidebarCollapsed ? 'rotate-180' : ''
                }`}
              />
            </button>

            <h1 className="font-bold text-slate-800 text-sm md:text-base truncate">
              Hệ thống hỗ trợ đồng hành & quản lý thiết bị của trẻ
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <button
              onClick={() => setSimulateMobile(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Giao diện Điện thoại</span>
            </button>

            <button
              onClick={() => handleSelectRoute('/requests')}
              className="relative p-2 rounded-full text-amber-500 hover:bg-amber-50 cursor-pointer"
              title="Yêu cầu từ con"
            >
              <Bell className="w-5 h-5" />
              {pendingRequestsList.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                {getInitials(data?.parent?.name)}
              </div>
              <div className="hidden lg:block leading-tight">
                <div className="font-bold text-xs text-slate-800 uppercase">
                  {data?.parent?.name}
                </div>
                <div className="text-[11px] text-slate-400">
                  {data?.parent?.syncStatus || 'Đã đồng bộ'}
                </div>
              </div>
            </div>

            <button
              onClick={onSwitchToAgent}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Mở Máy của Trẻ</span>
              <span className="sm:hidden">Máy con</span>
            </button>

            <button
              onClick={handleLogout}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Đăng xuất
            </button>
          </div>
        </header>

        {renderMainPages(false)}

        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 px-2 flex items-center justify-around z-30 shadow-lg">
          {mobileBottomTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeRoute === tab.route;
            return (
              <button
                key={tab.route}
                onClick={() => handleSelectRoute(tab.route)}
                className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 relative cursor-pointer ${
                  isActive ? tab.activeColor : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-bold">{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="absolute top-1 right-5 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex-1 py-1.5 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-bold">Menu</span>
          </button>
        </nav>

        {renderMobileDrawer()}
      </div>
    </div>
  );
}