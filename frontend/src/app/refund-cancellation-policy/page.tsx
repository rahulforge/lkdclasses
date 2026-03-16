import Footer from "@/components/Footer";

export default function RefundCancellationPolicyPage() {
  return (
    <>
      <section className="relative py-28 bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-center overflow-hidden">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Refund and Cancellation Policy</h1>
        <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed mb-8">
          Last updated: March 9, 2026
        </p>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-white rounded-t-[50%]" />
      </section>

      <section className="pb-16 bg-white px-6 md:px-12 -mt-12 relative z-10">
        <div className="max-w-4xl mx-auto bg-indigo-50 rounded-2xl p-8 shadow-lg text-gray-700 space-y-4">
          <p>Fees paid are for coaching services at LKD Classes.</p>
          <p>
            Cancellation or refund requests must be shared with complete student details via institute office or official email.
          </p>
          <p>
            Refunds are considered only for duplicate payment, excess payment, or technical transaction failure after verification.
          </p>
          <p>
            Once admission is confirmed and classes have started, fees are generally non-refundable except where legally required.
          </p>
          <p>Approved refunds are processed in 7 to 10 working days to the original payment source.</p>
          <p>For refund support: <strong>lkdclasses@gmail.com</strong>, <strong>+91 8002271522</strong>.</p>
        </div>
      </section>

      <Footer />
    </>
  );
}


