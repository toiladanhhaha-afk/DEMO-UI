// File: src/App.jsx
import React, { useState, useEffect } from 'react';
import { mockDashboardData } from './mockData';
import ParentPortal from './ParentPortal';
import ChildAgent from './ChildAgent';

export default function App({ inputData = mockDashboardData }) {
  const [data, setData] = useState(inputData);
  const [viewMode, setViewMode] = useState('PARENT'); // 'PARENT' | 'AGENT'

  useEffect(() => {
    setData(inputData);
  }, [inputData]);

  // 1. Duyệt yêu cầu của con (cộng giờ hoặc mở web, lưu chính xác lý do phụ huynh nhập)
  const handleApproveRequest = (reqId, customReply = '') => {
    setData((prev) => {
      const targetReq =
        (prev.requestsHistory || []).find((r) => r.id === reqId) ||
        prev.child?.pendingRequest;

      const replyMessage =
        customReply && customReply.trim()
          ? customReply.trim()
          : 'Bố/Mẹ đồng ý yêu cầu của con.';

      const addedMinutes =
        targetReq?.type === 'TIME_EXTENSION'
          ? parseInt(targetReq.value, 10) || 15
          : 0;

      const updatedHistory = (prev.requestsHistory || []).map((r) =>
        r.id === reqId
          ? { ...r, status: 'APPROVED', parentReply: replyMessage }
          : r
      );

      const nextPending =
        updatedHistory.find((r) => r.status === 'PENDING') || null;

      // Nếu duyệt mở khóa trang web, chuyển trang đó sang ALLOWED kèm lý do của phụ huynh
      let updatedDns = prev.dnsRecentEvents || [];
      if (targetReq?.type === 'UNBLOCK_WEB' && targetReq.value) {
        const domainName = targetReq.value.trim().toLowerCase();
        const now = new Date().toTimeString().split(' ')[0];
        const existingIdx = updatedDns.findIndex(
          (d) => d.domain.toLowerCase() === domainName
        );
        if (existingIdx >= 0) {
          updatedDns = updatedDns.map((d, idx) =>
            idx === existingIdx
              ? {
                  ...d,
                  action: 'ALLOWED',
                  reason: replyMessage,
                  time: now,
                  ruleBy: prev.parent.name,
                }
              : d
          );
        } else {
          updatedDns = [
            {
              domain: domainName,
              time: now,
              action: 'ALLOWED',
              reason: replyMessage,
              ruleBy: prev.parent.name,
            },
            ...updatedDns,
          ];
        }
      }

      return {
        ...prev,
        child: {
          ...prev.child,
          screenTime: {
            ...prev.child.screenTime,
            entertainmentLimitMinutes:
              prev.child.screenTime.entertainmentLimitMinutes + addedMinutes,
          },
          pendingRequest: nextPending,
        },
        dnsRecentEvents: updatedDns,
        requestsHistory: updatedHistory,
        policyChangeLogs: [
          {
            id: 'log_' + Date.now(),
            time: 'Vừa xong',
            actor: prev.parent.name,
            action: `Đã duyệt "${targetReq?.title || 'yêu cầu'}" — Lý do: "${replyMessage}"`,
          },
          ...(prev.policyChangeLogs || []),
        ],
      };
    });
  };

  // 2. Từ chối yêu cầu của con (lưu chính xác lý do phụ huynh nhập)
  const handleRejectRequest = (reqId, customReply = '') => {
    setData((prev) => {
      const targetReq =
        (prev.requestsHistory || []).find((r) => r.id === reqId) ||
        prev.child?.pendingRequest;

      const replyMessage =
        customReply && customReply.trim()
          ? customReply.trim()
          : 'Hôm nay muộn rồi, mai con dùng tiếp nhé.';

      const updatedHistory = (prev.requestsHistory || []).map((r) =>
        r.id === reqId
          ? { ...r, status: 'REJECTED', parentReply: replyMessage }
          : r
      );
      const nextPending =
        updatedHistory.find((r) => r.status === 'PENDING') || null;

      return {
        ...prev,
        child: {
          ...prev.child,
          pendingRequest: nextPending,
        },
        requestsHistory: updatedHistory,
        policyChangeLogs: [
          {
            id: 'log_' + Date.now(),
            time: 'Vừa xong',
            actor: prev.parent.name,
            action: `Từ chối "${targetReq?.title || 'yêu cầu'}" — Lý do: "${replyMessage}"`,
          },
          ...(prev.policyChangeLogs || []),
        ],
      };
    });
  };

  // 3. Sửa lại lý do phản hồi của một yêu cầu bất kỳ
  const handleUpdateRequestReply = (reqId, newReply = '') => {
    const cleanReply = newReply.trim();
    if (!cleanReply) return;
    setData((prev) => ({
      ...prev,
      requestsHistory: (prev.requestsHistory || []).map((r) =>
        r.id === reqId ? { ...r, parentReply: cleanReply } : r
      ),
      policyChangeLogs: [
        {
          id: 'log_' + Date.now(),
          time: 'Vừa xong',
          actor: prev.parent.name,
          action: `Cập nhật lý do phản hồi yêu cầu thành: "${cleanReply}"`,
        },
        ...(prev.policyChangeLogs || []),
      ],
    }));
  };

  // 4. Con gửi yêu cầu mới từ ChildAgent.jsx
  const handleSendChildRequest = ({ type, title, value, reason }) => {
    const newReq = {
      id: 'req_' + Math.floor(1000 + Math.random() * 9000),
      type,
      title,
      value,
      reason,
      createdAt: 'Vừa xong',
      status: 'PENDING',
      parentReply: '',
    };

    setData((prev) => ({
      ...prev,
      child: {
        ...prev.child,
        pendingRequest: newReq,
      },
      requestsHistory: [newReq, ...(prev.requestsHistory || [])],
    }));
  };

  // 5. Cập nhật giới hạn giải trí & ghi nhật ký minh bạch
  const handleUpdateEntertainmentLimit = (newMinutes) => {
    setData((prev) => ({
      ...prev,
      child: {
        ...prev.child,
        screenTime: {
          ...prev.child.screenTime,
          entertainmentLimitMinutes: newMinutes,
        },
      },
      policyChangeLogs: [
        {
          id: 'log_' + Date.now(),
          time: 'Vừa xong',
          actor: prev.parent.name,
          action: `Điều chỉnh giới hạn giải trí thành ${newMinutes} phút/ngày`,
        },
        ...(prev.policyChangeLogs || []),
      ],
    }));
  };

  // 6. Cập nhật trường chính sách & ghi nhật ký
  const handleUpdatePolicyField = (field, value, logText) => {
    setData((prev) => ({
      ...prev,
      policies: {
        ...prev.policies,
        [field]: value,
      },
      policyChangeLogs: logText
        ? [
            {
              id: 'log_' + Date.now(),
              time: 'Vừa xong',
              actor: prev.parent.name,
              action: logText,
            },
            ...(prev.policyChangeLogs || []),
          ]
        : prev.policyChangeLogs,
    }));
  };

  // 7. Cập nhật danh mục lọc web kèm lý do của Phụ huynh
  const handleUpdateWebCategory = (catId, newStatus, newReason) => {
    setData((prev) => {
      const targetCat = (prev.webCategories || []).find((c) => c.id === catId);
      const updatedReason =
        newReason !== undefined && newReason.trim() !== ''
          ? newReason.trim()
          : targetCat?.reason || 'Bảo vệ an toàn trên không gian mạng';

      return {
        ...prev,
        webCategories: (prev.webCategories || []).map((c) =>
          c.id === catId
            ? { ...c, status: newStatus, reason: updatedReason }
            : c
        ),
        policyChangeLogs: [
          {
            id: 'log_' + Date.now(),
            time: 'Vừa xong',
            actor: prev.parent.name,
            action: `Cập nhật danh mục "${targetCat?.name || catId}" (${
              newStatus === 'BLOCK'
                ? 'Chặn'
                : newStatus === 'LIMIT'
                ? 'Hạn chế'
                : 'Cho phép'
            }) — Lý do: "${updatedReason}"`,
          },
          ...(prev.policyChangeLogs || []),
        ],
      };
    });
  };

  // 8. Thêm hoặc cập nhật tên miền tùy chỉnh kèm lý do Chặn / Cho phép
  const handleAddCustomDomain = (rawDomain, customAction, customReason = '') => {
    const domain = (rawDomain || '').trim().toLowerCase();
    if (!domain) return null;

    const whitelist = data?.policies?.whitelistProtected || [
      'chinhphu.vn',
      '111.vn',
      '.edu.vn',
    ];
    const isProtected = whitelist.some((rule) =>
      rule.startsWith('.') ? domain.endsWith(rule) : domain === rule
    );

    if (isProtected && customAction === 'BLOCKED') {
      return {
        type: 'error',
        text: `Tên miền "${domain}" thuộc danh sách an toàn & giáo dục nên luôn được miễn trừ chặn vĩnh viễn!`,
      };
    }

    const finalAction = isProtected ? 'ALLOWED' : customAction;
    const finalReason = isProtected
      ? 'Danh sách miễn trừ cố định'
      : customReason.trim() ||
        (finalAction === 'BLOCKED'
          ? 'Phụ huynh chặn để đảm bảo an toàn và tập trung học tập'
          : 'Phụ huynh cho phép truy cập phục vụ học tập');

    const now = new Date().toTimeString().split(' ')[0];

    setData((prev) => {
      const existingIndex = (prev.dnsRecentEvents || []).findIndex(
        (item) => item.domain.toLowerCase() === domain
      );
      let updatedDns;
      if (existingIndex >= 0) {
        updatedDns = [...prev.dnsRecentEvents];
        updatedDns[existingIndex] = {
          ...updatedDns[existingIndex],
          time: now,
          action: finalAction,
          reason: finalReason,
          ruleBy: prev.parent.name,
        };
      } else {
        updatedDns = [
          {
            domain,
            time: now,
            action: finalAction,
            reason: finalReason,
            ruleBy: prev.parent.name,
          },
          ...(prev.dnsRecentEvents || []),
        ];
      }

      return {
        ...prev,
        dnsRecentEvents: updatedDns,
        policyChangeLogs: [
          {
            id: 'log_' + Date.now(),
            time: 'Vừa xong',
            actor: prev.parent.name,
            action: `${
              finalAction === 'BLOCKED' ? 'Chặn' : 'Cho phép'
            } trang "${domain}" — Lý do: "${finalReason}"`,
          },
          ...(prev.policyChangeLogs || []),
        ],
      };
    });

    return {
      type: 'success',
      text: `Đã ${
        finalAction === 'BLOCKED' ? 'chặn' : 'cho phép'
      } "${domain}" với lý do: "${finalReason}".`,
    };
  };

  // 9. Sửa lý do hoặc trạng thái trực tiếp trên từng dòng DNS
  const handleUpdateDnsRule = (domain, newAction, newReason) => {
    return handleAddCustomDomain(domain, newAction, newReason);
  };

  // 10. Đổi trạng thái Online/Offline
  const handleToggleDeviceOnline = () => {
    setData((prev) => ({
      ...prev,
      child: {
        ...prev.child,
        device: {
          ...prev.child.device,
          isOnline: !prev.child.device.isOnline,
        },
      },
    }));
  };

  // 11. Tạo mã OTP mới
  const handleGenerateOtp = () => {
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setData((prev) => ({
      ...prev,
      pairing: { otpCode: randomOtp, expiresInSeconds: 600 },
    }));
  };

  // 12. Cập nhật email phụ huynh khi đăng nhập
  const handleUpdateParentEmail = (newEmail) => {
    setData((prev) => ({
      ...prev,
      parent: { ...prev.parent, email: newEmail },
    }));
  };

  return viewMode === 'PARENT' ? (
    <ParentPortal
      data={data}
      onSwitchToAgent={() => setViewMode('AGENT')}
      onApproveRequest={handleApproveRequest}
      onRejectRequest={handleRejectRequest}
      onUpdateRequestReply={handleUpdateRequestReply}
      onUpdateEntertainmentLimit={handleUpdateEntertainmentLimit}
      onUpdatePolicyField={handleUpdatePolicyField}
      onUpdateWebCategory={handleUpdateWebCategory}
      onAddCustomDomain={handleAddCustomDomain}
      onUpdateDnsRule={handleUpdateDnsRule}
      onToggleDeviceOnline={handleToggleDeviceOnline}
      onGenerateOtp={handleGenerateOtp}
      onUpdateParentEmail={handleUpdateParentEmail}
    />
  ) : (
    <ChildAgent
      data={data}
      onSwitchToParent={() => setViewMode('PARENT')}
      onSendChildRequest={handleSendChildRequest}
    />
  );
}