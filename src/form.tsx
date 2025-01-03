import { useState, useEffect } from 'react';
import './style.css';
import { Loader } from 'lucide-react'; // Import Loader from lucide-react
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

const InvoiceForm = () => {

  const [rows, setRows] = useState([
    { description: '', quantity: 0, unitPrice: 0, amount: 0 }
  ]);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    address: '',
    gstin: '',
    cnename: '',
    caddress: '',
    cgstin: '',
  });
  const [paymentMode, setPaymentMode] = useState('Paid');
  const [totalAmount, setTotalAmount] = useState(0);
  const [billNumber, setBillNumber] = useState(0);
  const [currentDate] = useState(getCurrentDate());
  const [loading, setLoading] = useState(false); // Loading state for managing the loader
  const [additionalInfo, setAdditionalInfo] = useState(''); // State to store textbox value

  useEffect(() => {
    const storedBillNumber = localStorage.getItem('billNumber');
    if (storedBillNumber) {
      setBillNumber(parseInt(storedBillNumber, 10));
    }
  }, []);

  useEffect(() => {
    if (billNumber !== 0) {
      localStorage.setItem('billNumber', billNumber.toString());
    }
  }, [billNumber]);

  function getCurrentDate() {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const scriptURL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
  if (!scriptURL) {
    console.error("Google Script URL is not defined.");
    return;
  }

  const handleCustomerChange = (e: any) => {
    const { name, value } = e.target;
    setCustomerDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleRowChange = (index: any, name: any, value: any) => {
    const newRows = [...rows];
    (newRows[index] as any)[name] = value;
    newRows[index].amount = newRows[index].quantity * newRows[index].unitPrice;
    setRows(newRows);
    calculateTotal(newRows);
  };

  const addRow = () => {
    setRows([...rows, { description: '', quantity: 0, unitPrice: 0, amount: 0 }]);
  };

  const deleteRow = (index: any) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
    calculateTotal(newRows);
  };

  const calculateTotal = (rows: any) => {
    const total = rows.reduce((sum: any, row: any) => sum + row.amount, 0);
    setTotalAmount(total);
  };

  const handlebillno = () => {
    setBillNumber(0);  // Reset the bill number state
    localStorage.removeItem('billNumber');  // Remove the bill number from localStorage
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      const form = new FormData();
      form.append('CNr-name', customerDetails.name);
      form.append('Address', customerDetails.address);
      form.append('gstin', customerDetails.gstin);
      form.append('CNe-name', customerDetails.cnename);
      form.append('Address2', customerDetails.caddress);
      form.append('gstin2', customerDetails.cgstin);
      form.append('billno', billNumber.toString());
      form.append('date', currentDate);

      let allDescriptions = '';
      let allQuantities = '';
      let allUnitPrices = '';
      let allAmounts = '';

      rows.forEach((row) => {
        allDescriptions += `${row.description}\n`;
        allQuantities += `${row.quantity}\n`;
        allUnitPrices += `${row.unitPrice}\n`;
        allAmounts += `${row.amount.toFixed(2)}\n`;
      });

      form.append('particulars', allDescriptions.trim());
      form.append('quantity', allQuantities.trim());
      form.append('unitPrice', allUnitPrices.trim());
      form.append('amount', allAmounts.trim());
      form.append('total-amount', totalAmount.toFixed(2));
      form.append('payment-mode', paymentMode);
      form.append('additional-info', additionalInfo); // Append the additional info to the form

      const response = await fetch(scriptURL, {
        method: 'POST',
        body: form,
      });

      if (response.ok) {
        toast.success('Form submitted successfully!'); // Show success toast
        setRows([{ description: '', quantity: 0, unitPrice: 0, amount: 0 }]);
        setCustomerDetails({ name: '', address: '', gstin: '', cnename: '', caddress: '', cgstin: '' });
        setPaymentMode('Paid');
        setTotalAmount(0);
        setBillNumber(billNumber + 1);
        setAdditionalInfo('');
      } else {
        throw new Error('Failed to submit the form.');
      }
    } catch (error) {
      console.error('Error submitting the form:', error);
      toast.error('Error submitting the form. Please try again.'); // Show error toast
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="container">
      {loading && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.7)', // Optional: add a slight background dimming effect
          zIndex: '9999'
        }}>
          <Loader
            style={{
              fontSize: '30px',
              color: 'blue',
              animation: 'spin 1s linear infinite'
            }}
          />
        </div>
      )}

      <form action="" onSubmit={handleSubmit}>
        <h2 style={{ textAlign: "center", margin: "0px" }}>ADARSH INDIA TRANSPORT</h2>
        <div className="header">
          <div className="left-section">
            <p>AKHARAGHAT ROAD, MUZAFFARPUR, Bihar</p>
            <p>date: {currentDate}</p>
          </div>
          <div className="right-section">
            <p>GSTIN: 10CQDPK0090B2ZP</p>
            <p>Contact: 9939833523, 9128556595</p>
            <p style={{ fontWeight: "600" }}>Bill no: {billNumber}</p>
          </div>
        </div>

        <div className="box">
          <div className="customer-details">
            <label htmlFor="cnename">CNr. NAME:</label>
            <input
              className="ip"
              id="cnename"
              type="text"
              name="name"
              value={customerDetails.name}
              onChange={handleCustomerChange}
              placeholder="CNr. Name:"
            />
            <input
              className="ip"
              type="text"
              name="address"
              value={customerDetails.address}
              onChange={handleCustomerChange}
              placeholder="Address:"
            />
            <input
              className="ip"
              type="text"
              name="gstin"
              value={customerDetails.gstin}
              onChange={handleCustomerChange}
              placeholder="GSTIN No:"
            />
            <label htmlFor="cnename" style={{ marginTop: "10px" }}>CNe. Name:</label>
            <input
              className="ip"
              id="cnename"
              type="text"
              name="cnename"
              value={customerDetails.cnename}
              onChange={handleCustomerChange}
              placeholder="CNe. Name:"

            />
            <input
              className="ip"
              type="text"
              name="caddress"
              value={customerDetails.caddress}
              onChange={handleCustomerChange}
              placeholder="Address:"

            />
            <input
              className="ip"
              type="text"
              name="cgstin"
              value={customerDetails.cgstin}
              onChange={handleCustomerChange}
              placeholder="GSTIN No:"

            />
          </div>
        </div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th>Sl. No</th>
              <th>Particulars</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <input
                    type="text"
                    value={row.description}
                    onChange={(e) => handleRowChange(index, 'description', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.quantity}
                    onChange={(e) => handleRowChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.unitPrice}
                    onChange={(e) => handleRowChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  />
                </td>
                <td>{row.amount.toFixed(2)}</td>
                <td>
                  <input type="button" value="delete" onClick={() => deleteRow(index)} className="delete-btn" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{display:"flex",justifyContent:"space-between",margin:"10px"}}>
          <div>
            <input type="button" value="ADD" onClick={addRow} className="add-btn" style={{ width: "90px", height: "30px" }} /><br />
            <input type="text" value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} placeholder="Additional Information" style={{ marginTop: "5px", height: "3rem", width:"15rem"}} />
          </div>
          <div>
            <p>CGST (2.5%)</p>
            <p>SGST (2.5%)</p>
            <p>Total Amount: {(totalAmount).toFixed(2)}</p>
          </div>
        </div>

        <div className="payment-section">
          <label>
            Mode of Payment:
            <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
              <option value="Paid">Paid</option>
              <option value="Paid PP">Paid PP</option>
              <option value="TO PAY">TO PAY</option>
              <option value="TO PAY-PP">TO PAY-PP</option>
              <option value="TBB">TBB</option>
              <option value="TBB-PP">TBB-PP</option>
            </select>
          </label>
          <div className="payment-btns">
            <input type="submit" value="submit" className="submit-btn" />
            <input type="button" value="Reset Bill no" className='resetbill' onClick={handlebillno} />
          </div>
        </div>

        <div className="footer">
          <p className="footer-note">
            Description: ट्रांसपोर्ट टूटा फूटा, टीकेज, ब्रेकेज, कटा फटा, आकस्मिक दुर्घटना या चोरी - डेकली का जिम्मेदार नहीं है। किसी भी प्रकार की जानकारी 7 दिनों के अंदर केयर लें।
          </p>
        </div>
      </form>

      {/* ToastContainer to show toast messages */}
      <ToastContainer />
    </div>
  );
}
export default InvoiceForm;
