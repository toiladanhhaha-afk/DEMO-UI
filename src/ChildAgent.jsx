// File: src/ChildAgent.jsx
import React, { useState } from 'react';
import {
  Shield, Clock, BookOpen, Laptop, Flag,
  AlertOctagon, PhoneCall, History, Sparkles,
  ArrowLeft, ChevronLeft, MessageSquarePlus, Globe, Search
} from 'lucide-react';

// Tạo chữ viết tắt cho Avatar của con trên Header
const getInitials = (fullName = '') => {
  const cleanName = fullName.replace(/\(.*?\)/g, '').trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'BA';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function ChildAgent({
  data,
  onSwitchToParent,
  onSendChildRequest
}) {
  const [agentTab, setAgentTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showStartupNotice, setShowStartupNotice] = useState(true);

  // State tìm kiếm & chọn website bị chặn để xem chi tiết
  const [searchBlocked, setSearchBlocked] = useState('');
  const [selectedBlockedDomain, setSelectedBlockedDomain] = useState(null);

  // Modal Xin thêm giờ
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMinutes, setRequestMinutes] = useState('15 phút');
  const [requestReason, setRequestReason] = useState('');

  // Modal Báo trang bị chặn nhầm
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [unblockDomain, setUnblockDomain] = useState('scratch.mit.edu');
  const [unblockReason, setUnblockReason] = useState('');

  const screenTime = data?.child?.screenTime || {
    entertainmentUsedMinutes: 0,
    entertainmentLimitMinutes: 60,
    studyUsedMinutes: 0,
  };

  const remainingEntertainment = Math.max(
    0,
    screenTime.entertainmentLimitMinutes - screenTime.entertainmentUsedMinutes
  );

  // Danh sách toàn bộ các website bị chặn từ dnsRecentEvents[cite: 18]
  const blockedWebsitesList = (data?.dnsRecentEvents || []).filter(
    (e) => e.action === 'BLOCKED'
  );

  // Danh sách các website được phép / ép SafeSearch để đối chiếu minh bạch[cite: 18]
  const allowedWebsitesList = (data?.dnsRecentEvents || []).filter(
    (e) => e.action === 'ALLOWED' || e.action === 'SAFESEARCH'
  );

  // Các danh mục nội dung đang bị chặn hoặc hạn chế[cite: 18]
  const restrictedCategories = (data?.webCategories || []).filter(
    (c) => c.status === 'BLOCK' || c.status === 'LIMIT'
  );

  // Website bị chặn đang được chọn để xem ở màn hình Giải thích khi chặn[cite: 18]
  const blockedEvent =
    selectedBlockedDomain ||
    blockedWebsitesList[0] || {
      domain: 'bet88.com',
      time: '14:20:15',
      reason: 'Danh mục Cờ bạc độc hại',
      ruleBy: data?.parent?.name || 'Phụ huynh',
    };

  // Lọc danh sách website bị chặn theo từ khóa tìm kiếm của con[cite: 18]
  const filteredBlockedWebsites = blockedWebsitesList.filter(
    (item) =>
      item.domain.toLowerCase().includes(searchBlocked.toLowerCase()) ||
      (item.reason || '').toLowerCase().includes(searchBlocked.toLowerCase())
  );

  const pendingCount = (data?.requestsHistory || []).filter(
    (r) => r.status === 'PENDING'
  ).length;

  const handleTimeExtensionSubmit = (e) => {
    e.preventDefault();
    onSendChildRequest({
      type: 'TIME_EXTENSION',
      title: `Xin thêm ${requestMinutes}`,
      value: requestMinutes,
      reason: requestReason.trim() || 'Con cần thêm thời gian làm xong bài tập nhóm ạ.',
    });
    setRequestReason('');
    setShowRequestModal(false);
  };

  const handleUnblockSubmit = (e) => {
    e.preventDefault();
    onSendChildRequest({
      type: 'UNBLOCK_WEB',
      title: `Xin mở "${unblockDomain.trim()}"`,
      value: unblockDomain.trim(),
      reason: unblockReason.trim() || 'Con nghĩ trang này phục vụ học tập nhưng bị chặn nhầm ạ.',
    });
    setUnblockReason('');
    setShowUnblockModal(false);
  };

  // Cấu hình thanh chức năng dọc bên trái (đồng bộ với giao diện Phụ huynh)[cite: 18]
  const navItems = [
    {
      section: 'CHỨC NĂNG CHÍNH',
      items: [
        {
          id: 'overview',
          type: 'tab',
          label: 'Thời gian hôm nay',
          sub: 'Quỹ giờ & khung giờ mở',
          icon: Clock,
          iconColor: 'text-teal-600',
          iconBg: 'bg-teal-50',
        },
        {
          id: 'blocked_websites',
          type: 'tab',
          label: 'Website bị chặn',
          sub: 'Danh sách tên miền & lý do',
          icon: Globe,
          iconColor: 'text-rose-600',
          iconBg: 'bg-rose-50',
          badge: blockedWebsitesList.length,
        },
        {
          id: 'logs',
          type: 'tab',
          label: 'Nhật ký & Báo cáo chung',
          sub: 'Con và Bố/Mẹ cùng xem',
          icon: History,
          iconColor: 'text-purple-600',
          iconBg: 'bg-purple-50',
          badge: pendingCount,
        },
      ],
    },
    {
      section: 'GỬI YÊU CẦU TỚI BỐ MẸ',
      items: [
        {
          id: 'action_time',
          type: 'action',
          onClick: () => setShowRequestModal(true),
          label: 'Xin thêm giờ',
          sub: 'Gửi yêu cầu kèm lý do',
          icon: MessageSquarePlus,
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-50',
        },
        {
          id: 'action_unblock',
          type: 'action',
          onClick: () => setShowUnblockModal(true),
          label: 'Báo trang chặn nhầm',
          sub: 'Xin mở trang web học tập',
          icon: Flag,
          iconColor: 'text-rose-600',
          iconBg: 'bg-rose-50',
        },
      ],
    },
    {
      section: 'TÌNH HUỐNG DEMO',
      items: [
        {
          id: 'blocked',
          type: 'tab',
          label: 'Trang giải thích khi chặn',
          sub: 'Khi mở trang ngoài giờ',
          icon: AlertOctagon,
          iconColor: 'text-rose-600',
          iconBg: 'bg-rose-50',
        },
        {
          id: 'lockscreen',
          type: 'tab',
          label: 'Màn hình hết giờ & Khẩn cấp',
          sub: 'Luôn mở tổng đài 111',
          icon: PhoneCall,
          iconColor: 'text-amber-600',
          iconBg: 'bg-amber-50',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex font-sans">
      {/* SIDEBAR DỌC BÊN TRÁI (ĐỒNG BỘ VỚI PARENT PORTAL)[cite: 18] */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-200 shrink-0 select-none`}
      >
        <div>
          {/* Logo Header */}
          <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
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

          {/* Danh sách menu dọc[cite: 18] */}
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
                    const isActive = item.type === 'tab' && agentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() =>
                          item.type === 'action'
                            ? item.onClick()
                            : setAgentTab(item.id)
                        }
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition cursor-pointer relative ${
                          isActive
                            ? 'bg-slate-100 text-slate-900 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-2 bottom-2 w-1 bg-teal-600 rounded-r" />
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

        {/* Thông tin thiết bị ở chân Sidebar[cite: 18] */}
        {!sidebarCollapsed && (
          <div className="p-4 m-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {data?.child?.device?.name}
            </div>
            <div>Hồ sơ: {data?.child?.name}</div>
          </div>
        )}
      </aside>

      {/* KHU VỰC NỘI DUNG BÊN PHẢI[cite: 18] */}
      <div className="flex-1 flex flex-col min-w-0 justify-between">
        {/* HEADER TRẮNG CỦA MÁY CON[cite: 18] */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer"
              title="Thu gọn / Mở rộng menu"
            >
              <ChevronLeft
                className={`w-4 h-4 transition-transform ${
                  sidebarCollapsed ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div>
              <div className="font-bold text-sm md:text-base text-slate-900">
                Người Bạn Đồng Hành — Máy của {data?.child?.name}
              </div>
              <div className="text-[11px] text-slate-400 hidden sm:block">
                Thiết bị: {data?.child?.device?.name} • Đang hoạt động công khai cùng gia đình
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center">
                {getInitials(data?.child?.name)}
              </div>
              <div className="hidden md:block leading-tight">
                <div className="font-bold text-xs text-slate-800 uppercase">
                  {data?.child?.name}
                </div>
                <div className="text-[11px] text-slate-400">
                  Còn {remainingEntertainment}p giải trí
                </div>
              </div>
            </div>

            <button
              onClick={onSwitchToParent}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
              Quay lại App Phụ huynh
            </button>
          </div>
        </header>

        {/* NỘI DUNG CHÍNH CỦA AGENT[cite: 18] */}
        <main className="max-w-4xl w-full mx-auto p-6 space-y-5 flex-1">
          {showStartupNotice && (
            <div className="bg-white border border-teal-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs text-slate-600">
                  <strong className="text-slate-800">Xin chào {data?.child?.name}!</strong> Phần mềm Người Bạn Đồng Hành đang chạy công khai để hỗ trợ con giữ thói quen dùng máy lành mạnh. Không chụp màn hình, không đọc tin nhắn riêng tư.
                </div>
              </div>
              <button
                onClick={() => setShowStartupNotice(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
              >
                Đã hiểu
              </button>
            </div>
          )}

          {/* TAB 1: THỜI GIAN DÙNG MÁY HÔM NAY[cite: 18] */}
          {agentTab === 'overview' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-5">
                  <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
                      <circle
                        cx="44"
                        cy="44"
                        r="36"
                        stroke="#f1f5f9"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="44"
                        cy="44"
                        r="36"
                        stroke="#0d9488"
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 36}
                        strokeDashoffset={
                          2 *
                          Math.PI *
                          36 *
                          (1 -
                            remainingEntertainment /
                              Math.max(1, screenTime.entertainmentLimitMinutes))
                        }
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-extrabold text-slate-900">
                        {remainingEntertainment}p
                      </span>
                      <span className="text-[10px] text-slate-400">còn lại hôm nay</span>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Thời gian dùng máy hôm nay
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Con đã dùng <strong>{screenTime.entertainmentUsedMinutes}p</strong> giải trí trong tổng{' '}
                      <strong>{screenTime.entertainmentLimitMinutes}p</strong> được phép. Phần mềm sẽ nhắc trước 10 phút khi sắp hết giờ để con kịp lưu bài.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Hôm nay con được dùng
                </h3>
                <div className="space-y-2.5">
                  {(data?.allowedSchedules || []).map((sched) => (
                    <div
                      key={sched.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            sched.category === 'STUDY'
                              ? 'bg-emerald-50 text-emerald-600'
                              : sched.category === 'ENTERTAINMENT'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-purple-50 text-purple-600'
                          }`}
                        >
                          {sched.category === 'STUDY' ? (
                            <BookOpen className="w-5 h-5" />
                          ) : sched.category === 'ENTERTAINMENT' ? (
                            <Clock className="w-5 h-5" />
                          ) : (
                            <Laptop className="w-5 h-5" />
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
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
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

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  ✋ Xin thêm giờ
                </button>
                <button
                  onClick={() => setShowUnblockModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5 text-rose-500" /> Con nghĩ trang này bị chặn nhầm
                </button>
                <button
                  onClick={() => setAgentTab('blocked_websites')}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-rose-600" /> Xem website bị chặn ({blockedWebsitesList.length})
                </button>
                <button
                  onClick={() => setAgentTab('logs')}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  📊 Xem báo cáo của con
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="text-[11px] font-bold uppercase text-slate-400 mb-2">
                  ↓ Tình huống Demo cho sinh viên (Bấm thử)
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setAgentTab('blocked')}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-600 cursor-pointer"
                  >
                    Mở 1 trang/app ngoài giờ →
                  </button>
                  <button
                    onClick={() => setAgentTab('lockscreen')}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-600 cursor-pointer"
                  >
                    Hết giờ dùng máy →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB MỚI: DANH SÁCH CÁC WEBSITE BỊ CHẶN[cite: 18] */}
          {agentTab === 'blocked_websites' && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-rose-600" />
                      Danh sách các website đang bị chặn ({blockedWebsitesList.length})
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Con có thể xem rõ tên miền nào đang bị chặn, lý do cụ thể từ Bố/Mẹ và gửi đề xuất mở lại nếu trang đó phục vụ việc học.
                    </p>
                  </div>

                  {/* Ô tìm kiếm tên miền hoặc lý do[cite: 18] */}
                  <div className="relative min-w-[220px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchBlocked}
                      onChange={(e) => setSearchBlocked(e.target.value)}
                      placeholder="Tìm tên miền hoặc lý do..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                    />
                  </div>
                </div>

                {/* Danh sách thẻ các website bị chặn[cite: 18] */}
                {filteredBlockedWebsites.length === 0 ? (
                  <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                    Không tìm thấy website nào bị chặn khớp với từ khóa của con.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredBlockedWebsites.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-4 hover:border-rose-200 transition"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                            <AlertOctagon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900">
                                {item.domain}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                                Đã chặn
                              </span>
                              <span className="text-[11px] font-mono text-slate-400">
                                {item.time}
                              </span>
                            </div>
                            <div className="text-xs text-slate-700 mt-1">
                              <span className="text-slate-400">Lý do: </span>
                              <strong>{item.reason || 'Bảo vệ an toàn internet'}</strong>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Người đặt quy tắc: <strong className="text-slate-600">{item.ruleBy || data?.parent?.name}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedBlockedDomain(item);
                              setAgentTab('blocked');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                          >
                            Xem giải thích
                          </button>
                          <button
                            onClick={() => {
                              setUnblockDomain(item.domain);
                              setShowUnblockModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Flag className="w-3 h-3" /> Xin mở trang
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Các danh mục nội dung đang bị chặn / hạn chế[cite: 18] */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
                    Danh mục nội dung đang hạn chế trên máy
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Các nhóm trang web dưới đây đang được Bố/Mẹ bật bộ lọc bảo vệ tự động
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {restrictedCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-800">{cat.name}</div>
                        {cat.reason && (
                          <div className="text-[11px] text-slate-500 mt-0.5 italic">
                            Lý do: "{cat.reason}"
                          </div>
                        )}
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                          cat.status === 'BLOCK'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {cat.status === 'BLOCK' ? 'Chặn hoàn toàn' : 'Giới hạn giờ'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Các website được phép kèm lý do của Bố/Mẹ[cite: 18] */}
              {allowedWebsitesList.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
                    Các website được phép truy cập ({allowedWebsitesList.length})
                  </h3>
                  <div className="space-y-2">
                    {allowedWebsitesList.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800">{item.domain}</span>
                          <span className="text-slate-500"> — {item.reason}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.action === 'SAFESEARCH' ? 'SafeSearch' : 'Cho phép'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MÀN HÌNH GIẢI THÍCH KHI CHẶN[cite: 18] */}
          {agentTab === 'blocked' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Trang web "{blockedEvent.domain}" tạm thời không mở được
              </h2>
              <p className="text-xs text-slate-600">
                Đây không phải lỗi mạng. Trang này đang được hạn chế để bảo vệ con trên môi trường internet.
              </p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div>
                  <span className="text-slate-400">Lý do:</span>{' '}
                  <strong className="text-slate-800">{blockedEvent.reason}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Người thiết lập quy tắc:</span>{' '}
                  <strong className="text-slate-800">{blockedEvent.ruleBy}</strong>
                </div>
                {blockedEvent.time && (
                  <div>
                    <span className="text-slate-400">Thời gian ghi nhận:</span>{' '}
                    <span className="font-mono text-slate-600">{blockedEvent.time}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setUnblockDomain(blockedEvent.domain);
                    setShowUnblockModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
                >
                  Con nghĩ trang này bị chặn nhầm
                </button>
                <button
                  onClick={() => setAgentTab('blocked_websites')}
                  className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer"
                >
                  Xem tất cả website bị chặn ({blockedWebsitesList.length})
                </button>
                <button
                  onClick={() => setAgentTab('overview')}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Quay lại
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: NHẬT KÝ & BÁO CÁO HAI CHIỀU[cite: 18] */}
          {agentTab === 'logs' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Báo cáo & Nhật ký thay đổi luật (Con và Bố/Mẹ cùng xem)
                </h2>
                <p className="text-xs text-slate-500">
                  Con được xem cùng bộ thống kê như Bố/Mẹ và biết rõ mỗi khi Bố/Mẹ thay đổi khung giờ hoặc thêm lý do chặn/mở web.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold uppercase text-slate-400">
                  Nhật ký thay đổi luật của {data?.parent?.name}
                </div>
                {(data?.policyChangeLogs || []).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-700">{log.action}</span>
                    <span className="text-slate-400">{log.time}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold uppercase text-slate-400">
                  Phản hồi yêu cầu gần đây
                </div>
                {(data?.requestsHistory || []).map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div>
                        <span className="font-bold text-slate-800">{req.title}: </span>
                        <span className="text-slate-600">"{req.reason}"</span>
                      </div>
                      {req.parentReply && (
                        <div className="text-[11px] text-teal-700 mt-0.5 font-medium">
                          💬 Phản hồi của Bố/Mẹ: "{req.parentReply}"
                        </div>
                      )}
                    </div>
                    <span
                      className={`font-bold px-2.5 py-0.5 rounded-full w-fit ${
                        req.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : req.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {req.status === 'APPROVED'
                        ? 'Đã duyệt'
                        : req.status === 'REJECTED'
                        ? 'Từ chối'
                        : 'Đang chờ'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MÀN HÌNH HẾT GIỜ NHƯNG LUÔN MỞ KÊNH KHẨN CẤP[cite: 18] */}
          {agentTab === 'lockscreen' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Đã hết giờ giải trí hôm nay
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Các ứng dụng trò chơi đã tạm khóa để con nghỉ ngơi. Tuy nhiên, các kênh hỗ trợ khẩn cấp và cổng thông tin trường học luôn hoạt động 24/7.
              </p>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex flex-wrap items-center justify-center gap-3">
                <span className="inline-flex items-center gap-1 font-bold">
                  <PhoneCall className="w-4 h-4" /> Tổng đài Quốc gia Bảo vệ Trẻ em: 111 (Miễn phí)
                </span>
                <span>•</span>
                <span className="font-semibold">Cứu hộ khẩn cấp: 113 / 114 / 115</span>
              </div>
              <button
                onClick={() => setShowRequestModal(true)}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold cursor-pointer"
              >
                ✋ Xin thêm giờ với Bố/Mẹ
              </button>
            </div>
          )}
        </main>

        {/* THANH KHAY HỆ THỐNG (SYSTEM TRAY) LUÔN HIỂN THỊ[cite: 18] */}
        <footer className="h-10 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700">
              Khay hệ thống: OpenGuard Kids Agent đang hoạt động
            </span>
          </div>
          <div>
            Còn {remainingEntertainment} phút giải trí • Giới nghiêm: {data?.policies?.curfewStart}
          </div>
        </footer>
      </div>

      {/* MODAL XIN THÊM GIỜ[cite: 18] */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Xin thêm giờ</h3>
            <p className="text-xs text-slate-500">
              Yêu cầu sẽ gửi tới Bố/Mẹ kèm lý do. Bố/Mẹ duyệt thì con có thêm giờ ngay.
            </p>

            <div className="flex gap-2">
              {['15 phút', '30 phút', '45 phút'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRequestMinutes(val)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                    requestMinutes === val
                      ? 'bg-teal-50 border-teal-600 text-teal-800'
                      : 'border-slate-200 text-slate-600 bg-slate-50'
                  }`}
                >
                  +{val}
                </button>
              ))}
            </div>

            <form onSubmit={handleTimeExtensionSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Lý do (con viết cho Bố/Mẹ hiểu):
                </label>
                <textarea
                  rows="3"
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="Ví dụ: con cần thêm thời gian làm xong bài tập nhóm..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold cursor-pointer"
                >
                  Gửi yêu cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BÁO TRANG BỊ CHẶN NHẦM[cite: 18] */}
      {showUnblockModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Con nghĩ trang này bị chặn nhầm
            </h3>
            <form onSubmit={handleUnblockSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tên miền / Ứng dụng cần mở:
                </label>
                <input
                  type="text"
                  value={unblockDomain}
                  onChange={(e) => setUnblockDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Lý do gửi Bố/Mẹ:
                </label>
                <textarea
                  rows="3"
                  value={unblockReason}
                  onChange={(e) => setUnblockReason(e.target.value)}
                  placeholder="Ví dụ: Trang này cô giáo giao để làm bài tập lập trình ạ..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUnblockModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
                >
                  Gửi Bố/Mẹ duyệt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}