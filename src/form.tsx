import { useState } from 'react';
import './style.css';

const InvoiceForm = () => {
  const [rows, setRows] = useState([
    { description: '', quantity: 0, unitPrice: 0, amount: 0 }
  ]);

  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    address: '',
    gstin: '',
    cnename: '',  // Add these fields
    caddress: '',
    cgstin: '',
  });

  const [paymentMode, setPaymentMode] = useState('Paid');
  const [totalAmount, setTotalAmount] = useState(0);
  const [billNumber, setBillNumber] = useState(0); // Bill number state
  const [currentDate] = useState(getCurrentDate()); // Date state

  // Function to get current date in dd/mm/yyyy format
  function getCurrentDate() {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const scriptURL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;  ;
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
    setBillNumber(0);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const form = new FormData();

      // Append the original customer details
      form.append('CNr-name', customerDetails.name);
      form.append('Address', customerDetails.address);
      form.append('gstin', customerDetails.gstin);

      // Append the new customer details (cnrname, caddress, cgstin)
      form.append('CNe-name', customerDetails.cnename);
      form.append('Address2', customerDetails.caddress);
      form.append('gstin2', customerDetails.cgstin);

      // Append date and bill number
      form.append('billno', billNumber.toString());
      form.append('date', currentDate); // Include the date field

      let allDescriptions = '';
      let allQuantities = '';
      let allUnitPrices = '';
      let allAmounts = '';

      rows.forEach((row) => {
        allDescriptions += `${row.description}\n`;  // Add descriptions, separated by newlines
        allQuantities += `${row.quantity}\n`;      // Add quantities, separated by newlines
        allUnitPrices += `${row.unitPrice}\n`;     // Add unit prices, separated by newlines
        allAmounts += `${row.amount.toFixed(2)}\n`; // Add amounts, separated by newlines
      });

      // Append concatenated data into respective fields
      form.append('particulars', allDescriptions.trim());  // All descriptions in one field
      form.append('quantity', allQuantities.trim());      // All quantities in one field
      form.append('unitPrice', allUnitPrices.trim());     // All unit prices in one field
      form.append('amount', allAmounts.trim());

      form.append('total-amount', totalAmount.toFixed(2));
      form.append('payment-mode', paymentMode);

      const response = await fetch(scriptURL, {
        method: 'POST',
        body: form,
      });

      if (response.ok) {
        alert('Form submitted successfully!');
        setRows([{ description: '', quantity: 0, unitPrice: 0, amount: 0 }]);
        setCustomerDetails({ name: '', address: '', gstin: '', cnename: '', caddress: '', cgstin: '' });
        setPaymentMode('Paid');
        setTotalAmount(0);
        setBillNumber(billNumber + 1);
      } else {
        throw new Error('Failed to submit the form.');
      }
    } catch (error) {
      console.error('Error submitting the form:', error);
      alert('Error submitting the form. Please try again.');
    }
  };



  return (
    <div className="container">
      <form action="">

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
              className='ip'
              id="cnename"
              type="text"
              name="name"
              value={customerDetails.name}
              onChange={handleCustomerChange}
              placeholder="CNr. Name:"
              required
            />
            <input
              className='ip'
              type="text"
              name="address"
              value={customerDetails.address}
              onChange={handleCustomerChange}
              placeholder="Address:"
            />
            <input
              className='ip'
              type="text"
              name="gstin"
              value={customerDetails.gstin}
              onChange={handleCustomerChange}
              placeholder="GSTIN No:"
            />
            {/* New Fields Below */}
            <label htmlFor="cnename" style={{ marginTop: "10px" }}>CNe. Name:</label>
            <input
              className='ip'
              id="cnename"
              type="text"
              name="cnename"
              value={customerDetails.cnename}
              onChange={handleCustomerChange}
              placeholder="CNe. Name:"
            />
            <input
              className='ip'
              type="text"
              name="caddress"
              value={customerDetails.caddress}
              onChange={handleCustomerChange}
              placeholder="Address:"
            />
            <input
              className='ip'
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
                  <input type="button" value="delete" onClick={() => deleteRow(index)} className="delete-btn"/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <input type="button" value="ADD" onClick={addRow} className="add-btn" style={{ width: "90px", height: "30px" }}/>

        <div className="total">
          <p>CGST (2.5%)</p>
          <p>SGST (2.5%)</p>
          <p>Total Amount: {(totalAmount).toFixed(2)}</p>
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
            <input type="submit" value="submit" onClick={handleSubmit} className="submit-btn" />
            <input type="button" value="Reset Bill no" onClick={handlebillno} />
          </div>
        </div>

        <div className="footer">
          <p className="footer-note">
            Description: ट्रांसपोर्ट टूटा फूटा, टीकेज, ब्रेकेज, कटा फटा, आकस्मिक दुर्घटना या चोरी - डेकली का जिम्मेदार नहीं है। किसी भी प्रकार की जानकारी 7 दिनों के अंदर केयर लें।
          </p>
        </div>
      </form>
    </div >
  );
};

export default InvoiceForm;
