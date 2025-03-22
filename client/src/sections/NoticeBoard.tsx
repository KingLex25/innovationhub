import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

interface Notice {
  id: number;
  title: string;
  content: string;
  date: string;
  link?: {
    url: string;
    text: string;
  };
}

interface NoticeBoardProps {
  notices?: Notice[];
}

export default function NoticeBoard({ notices: propNotices }: NoticeBoardProps) {
  // If notices are not provided via props, fetch them
  const { data: fetchedNotices } = useQuery({
    queryKey: ["/api/notices"],
    enabled: !propNotices,
  });

  const notices = propNotices || fetchedNotices || [];

  return (
    <section id="notices" className="py-16 md:py-24 bg-darkGray">
      <div className="container mx-auto px-4">
        <h2 className="text-gold text-3xl md:text-4xl font-playfair font-bold mb-8 text-center">Notice Board</h2>
        
        <div className="bg-darkBg rounded-xl border border-gold/20 shadow-lg max-w-3xl mx-auto overflow-hidden">
          <div className="bg-gold/10 p-4 border-b border-gold/20 flex items-center">
            <i className="fas fa-bullhorn text-gold mr-3"></i>
            <h3 className="text-gold font-playfair text-xl font-bold">Announcements</h3>
          </div>
          
          {notices.length > 0 ? (
            <div className="divide-y divide-gold/10">
              {notices.map((notice) => (
                <div key={notice.id} className="p-4 md:p-6 hover:bg-gold/5 transition-colors duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-gold font-montserrat font-semibold">{notice.title}</h4>
                    <span className="text-lightText/60 text-xs">
                      {formatDistanceToNow(new Date(notice.date), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-lightText text-sm mb-3">
                    {notice.content}
                  </p>
                  {notice.link && (
                    <a 
                      href={notice.link.url} 
                      className="text-gold text-sm font-montserrat hover:underline flex items-center"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>{notice.link.text}</span>
                      <i className="fas fa-arrow-right ml-1 text-xs"></i>
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-lightText">No announcements available at the moment.</p>
            </div>
          )}
          
          {notices.length > 4 && (
            <div className="bg-darkGray/50 p-4 border-t border-gold/20 text-center">
              <a href="#" className="text-gold text-sm font-montserrat hover:underline flex items-center justify-center">
                <span>View All Announcements</span>
                <i className="fas fa-chevron-right ml-1 text-xs"></i>
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
