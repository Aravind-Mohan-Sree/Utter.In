'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { FaFileAlt, FaTimes } from 'react-icons/fa';
import { GoX } from 'react-icons/go';
import { MdReportProblem } from 'react-icons/md';

import { SearchAndFilter } from '~components/form/SearchAndFilter';
import { Card } from '~components/ui/Card';
import { DateAndTime } from '~components/ui/DateAndTime';
import { Pagination } from '~components/ui/Pagination';
import { ResultsSummary } from '~components/ui/ResultsSummary';
import { getAbuseReports, handleAbuseReport } from '~services/admin/reportsService';
import { errorHandler } from '~utils/errorHandler';
import { utterAlert } from '~utils/utterAlert';
import { utterRadioAlert } from '~utils/utterRadioAlert';
import { utterToast } from '~utils/utterToast';

interface IReportMessage {
  senderId: string;
  text?: string;
  timestamp: string | Date;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
}

interface IReport {
  id: string;
  status: 'Pending' | 'Resolved' | 'Rejected';
  reporter: { id: string; name: string; email: string; role: string };
  reported: { id: string; name: string; email: string; role: string };
  type: string;
  description: string;
  channel: 'chat' | 'video';
  createdAt: string | Date;
  messages?: IReportMessage[];
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<IReport[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<IReport | null>(null);
  const [activePreview, setActivePreview] = useState<{ url: string; type: string } | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAbuseReports({ 
        page: currentPage, 
        limit: itemsPerPage,
        search: debouncedQuery,
        status: activeFilter
      });
      setReports(res.reports as IReport[]);
      setTotal(res.total);
    } catch (err) {
      utterToast.error(errorHandler(err));
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedQuery, activeFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleAction = async (reportId: string, status: 'Resolved' | 'Rejected') => {
    if (status === 'Rejected') {
      utterRadioAlert(
        'Reject Report?',
        {
          'Insufficient evidence': 'Insufficient evidence',
          'Does not violate community standards': 'Does not violate community standards',
          'Spam or duplicate report': 'Spam or duplicate report',
          'Report is factually incorrect': 'Report is factually incorrect',
          'Other': 'Other'
        },
        'Reject Now',
        async (reason: string) => {
          try {
            await handleAbuseReport(reportId, 'Rejected', reason);
            utterToast.success('Report rejected successfully');
            setSelectedReport(null);
            fetchReports();
          } catch (err) {
            utterToast.error(errorHandler(err));
          }
        }
      );
      return;
    }

    utterAlert({
      title: 'Resolve Report?',
      text: 'Resolving this report will automatically BLOCK the reported user/tutor. Are you sure?',
      icon: 'warning',
      showCancel: true,
      onConfirm: async () => {
        try {
          await handleAbuseReport(reportId, status);
          utterToast.success(`Report ${status.toLowerCase()}ed successfully`);
          setSelectedReport(null);
          fetchReports();
        } catch (err) {
          utterToast.error(errorHandler(err));
        }
      }
    });
  };

  const from = total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, total);

  return (
    <div className="w-full space-y-6">
      <SearchAndFilter
        placeholder="Search by name, email or type..."
        filters={['All', 'Pending', 'Resolved', 'Rejected']}
        activeFilter={activeFilter}
        onFilterChange={(val) => {
          setActiveFilter(val);
          setCurrentPage(1);
        }}
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
      />

      <ResultsSummary
        from={from}
        to={to}
        filteredCount={total}
        totalCount={total}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        label="reports"
      />

      {loading && reports.length === 0 ? (
        <div className="h-[40vh] w-full flex flex-col items-center justify-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-[5px] border-rose-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-[5px] border-transparent border-t-rose-500 rounded-full animate-spin"></div>
            <div className="absolute inset-5 bg-rose-500/5 rounded-full animate-pulse"></div>
          </div>
          <p className="mt-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] animate-pulse">Retrieving Reports</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="text-gray-400 mb-4">
            <MdReportProblem className="mx-auto w-24 h-24" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No reports found
          </h3>
          <p className="text-sm text-gray-500 text-center max-w-md">
            {searchQuery || activeFilter !== 'All'
              ? 'Try adjusting your search or filter criteria.'
              : 'There are no abuse reports available at the moment.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card
              key={report.id}
              type="report"
              id={report.id}
              status={report.status}
              reporter={report.reporter}
              reported={report.reported}
              abuseType={report.type}
              channel={report.channel}
              dateTime={new Date(report.createdAt).toLocaleString()}
              onViewDetails={() => setSelectedReport(report)}
            />
          ))}
        </div>
      )}

      {total > itemsPerPage && (
        <div className="flex justify-center pt-8">
            <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(total / itemsPerPage)}
                onPageChange={setCurrentPage}
            />
        </div>
      )}

      {/* Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-[100] p-4" onClick={() => setSelectedReport(null)}>
          <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <h3 className="text-xl font-bold text-gray-800">Review Report</h3>
              <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                <GoX size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)] no-scrollbar space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Reporter ({selectedReport.reporter.role})</p>
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-gray-200">
                    <p className="font-bold text-gray-800 text-base">{selectedReport.reporter.name}</p>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5 break-all">{selectedReport.reporter.email}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Reported ({selectedReport.reported.role})</p>
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-gray-200">
                    <p className="font-bold text-rose-600 text-base">{selectedReport.reported.name}</p>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5 break-all">{selectedReport.reported.email}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Abuse Type</p>
                  <div className="inline-flex items-center px-4 py-2 bg-rose-50 text-rose-600 rounded-full text-xs font-bold border border-rose-100">
                    {selectedReport.type}
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact Channel</p>
                  <div className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-600 rounded-full text-xs font-bold border border-gray-100 capitalize">
                    {selectedReport.channel} Interaction
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Incident Summary</p>
                <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 text-sm text-gray-700 leading-relaxed shadow-inner">
                  {selectedReport.description}
                </div>
              </div>

              {selectedReport.messages && selectedReport.messages.length > 0 && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    {selectedReport.channel === 'video' ? 'Evidence (Video Context)' : 'Evidence (Chat History Log)'}
                  </p>
                  <div className="space-y-6 bg-gray-50 p-6 rounded-[32px] border border-gray-200/50 shadow-inner">
                    {/* Modular Evidence Grid */}
                    {selectedReport.messages.some((m: IReportMessage) => typeof m.text === 'string' && m.text.startsWith('VIDEO_EVIDENCE_AUTO')) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-gray-200/50">
                        {selectedReport.messages
                          .filter((m: IReportMessage) => typeof m.text === 'string' && (m.text.startsWith('VIDEO_EVIDENCE_AUTO') || m.text === 'VIDEO EVIDENCE (Last 60s Clip)'))
                          .map((msg: IReportMessage, idx: number) => (
                            <div key={`auto-${idx}`} className="space-y-2">
                              <div 
                                className="relative group cursor-pointer border border-gray-200/50 shadow-md overflow-hidden rounded-3xl w-full aspect-video bg-black" 
                                onClick={() => setActivePreview({ url: msg.fileUrl!, type: msg.fileType! })}
                              >
                                <video 
                                  src={msg.fileUrl} 
                                  className="w-full h-full object-contain" 
                                  controls={false}
                                  muted
                                  playsInline
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/10 transition-all">
                                  <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 text-white group-hover:scale-105 transition-transform">
                                    <svg className="w-8 h-8 fill-current translate-x-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Chat Messages and other evidence */}
                    {selectedReport.messages
                      .filter((m: IReportMessage) => !(typeof m.text === 'string' && (m.text.startsWith('VIDEO_EVIDENCE_AUTO') || m.text === 'VIDEO EVIDENCE (Last 60s Clip)')))
                      .map((msg: IReportMessage, idx: number) => (
                        <div key={`chat-${idx}`} className={`flex flex-col ${msg.senderId === selectedReport.reporter.id ? 'items-start' : 'items-end'}`}>
                          <div className={`max-w-[90%] p-4 rounded-3xl text-[13px] shadow-sm leading-relaxed ${
                            msg.senderId === selectedReport.reporter.id 
                              ? 'bg-white text-gray-800 rounded-bl-none border border-gray-100' 
                              : 'bg-rose-500 text-white rounded-br-none'
                          }`}>
                            {msg.fileUrl ? (
                              <div className="mb-3 space-y-2">
                                {msg.fileType?.startsWith('image/') ? (
                                  <Image 
                                    src={msg.fileUrl} 
                                    alt="Evidence" 
                                    width={400}
                                    height={300}
                                    className="max-h-60 w-auto rounded-2xl border border-gray-100/20 shadow-sm cursor-pointer hover:opacity-90 transition-opacity" 
                                    onClick={() => setActivePreview({ url: msg.fileUrl!, type: msg.fileType! })}
                                  />
                                ) : msg.fileType?.startsWith('video/') ? (
                                  <div 
                                    className="relative group cursor-pointer border border-gray-100/20 shadow-sm overflow-hidden rounded-2xl w-64 h-40" 
                                    onClick={() => setActivePreview({ url: msg.fileUrl!, type: msg.fileType! })}
                                  >
                                    <video 
                                      src={msg.fileUrl} 
                                      className="w-full h-full object-cover" 
                                      onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                                      onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                                      muted
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all">
                                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <a 
                                    href={msg.fileUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-3 p-3 rounded-2xl border text-xs font-bold transition-all hover:bg-white/10 ${
                                      msg.senderId === selectedReport.reporter.id 
                                        ? 'bg-gray-50 border-gray-100 text-gray-700' 
                                        : 'bg-white/10 border-white/20 text-white'
                                    }`}
                                  >
                                    <div className={`p-2 rounded-xl ${msg.senderId === selectedReport.reporter.id ? 'bg-white' : 'bg-white/20'}`}>
                                      <FaFileAlt size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="truncate uppercase tracking-wider">{msg.fileName || 'Attached Evidence'}</p>
                                      <p className="text-[9px] opacity-60 mt-0.5">Click to view/download</p>
                                    </div>
                                  </a>
                                )}
                                {msg.text && msg.text !== '[Attachment]' && msg.text !== '[Content Unavailable]' && <p className={`font-medium ${msg.fileUrl ? 'pt-1 border-t border-white/10' : ''}`}>{msg.text}</p>}
                              </div>
                            ) : (
                              msg.text && msg.text !== '[Attachment]' && msg.text !== '[Content Unavailable]' && <p className="font-medium">{msg.text}</p>
                            )}
                            <DateAndTime 
                              date={msg.timestamp} 
                              label="" 
                              showTime={true} 
                              className={`mt-2 !text-[9px] font-bold uppercase tracking-widest ${msg.senderId === selectedReport.reporter.id ? 'text-gray-400' : 'text-white/70'}`} 
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {selectedReport.status === 'Pending' && (
              <div className="flex gap-4 p-8 pt-4 bg-white border-t border-gray-100">
                <button
                  onClick={() => handleAction(selectedReport.id, 'Rejected')}
                  className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-black text-xs uppercase tracking-widest py-5 rounded-2xl border border-gray-200 transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleAction(selectedReport.id, 'Resolved')}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-rose-200 transition-all active:scale-95 cursor-pointer"
                >
                  Resolve & Restrict
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Media Preview Modal */}
      {activePreview && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300 backdrop-blur-md bg-black/80"
          onClick={() => setActivePreview(null)}
        >
          <button
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-90 z-[160] cursor-pointer"
            onClick={() => setActivePreview(null)}
          >
            <FaTimes size={20} />
          </button>
          <div
            className="relative max-w-4xl w-full aspect-video flex items-center justify-center bg-black rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {activePreview.type.startsWith('image/') ? (
              <Image
                src={activePreview.url}
                alt="Evidence preview"
                fill
                className="object-contain"
              />
            ) : (
              <video
                src={activePreview.url}
                className="w-full h-full object-contain shadow-2xl"
                controls
                autoPlay
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
