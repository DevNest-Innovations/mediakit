'use client';
import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
	open: boolean;
	onClose: () => void;
	title?: string;
	children?: ReactNode;
};

export default function Modal({ open, onClose, title, children }: Props) {
	return (
		<AnimatePresence>
			{open && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
					onClick={onClose}
				>
					<motion.div
						initial={{ y: 12, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: 12, opacity: 0 }}
						onClick={(e) => e.stopPropagation()}
						className="bg-white dark:bg-slate-800 p-6 rounded max-w-md w-full shadow-lg"
					>
						{title && <h3 className="font-semibold">{title}</h3>}
						<div className="mt-3">{children}</div>
						<div className="mt-4 text-right">
							<button onClick={onClose} className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-700">
								Close
							</button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
