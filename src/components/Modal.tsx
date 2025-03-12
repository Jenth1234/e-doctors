interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay with blur effect */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white/90 backdrop-blur-md rounded-lg shadow-xl max-w-2xl w-full transition-all duration-300 border border-gray-200/20">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 transition-colors"
          >
            <span className="sr-only">Đóng</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Modal body */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 