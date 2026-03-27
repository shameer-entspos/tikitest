
// TimeSheetStatusMessages

export function TimeSheetStatusMessages({ status }: { status: 'approved' | "review" | "not" }) {
    if (status === 'approved') {
        return (
            <img src="/svg/timesheet_app/approved.svg" alt="approved" />
        );
    } else if (status === 'review') {
        return (
            <img src="/svg/timesheet_app/under_review.svg" alt="under_review" />
        );
    } else if (status === 'not') {
        return (
            <img src="/svg/timesheet_app/not_approved.svg" alt="not_approved" />
        );
    } else {
        return null; // Return null if the status does not match any condition
    }
}

//  TimeSheetReviewButtons - quick actions update status immediately (no modal)
export function TimeSheetReviewButtons({ status, handleStatus }: { status: 'approved' | "review" | "not", handleStatus: (status: "not" | "approved" | "review") => void }) {
    if (status === 'approved') {
        return (
            <div className="flex gap-2">
                <img src="/svg/timesheet_app/not_approved_btn.svg" alt="not_approved" className="cursor-pointer" onClick={() => { handleStatus('not') }} />
                <img src="/svg/timesheet_app/under_review_btn.svg" alt="review" className="cursor-pointer" onClick={() => { handleStatus('review') }} />
            </div>
        );
    } else if (status === 'review') {
        return (
            <div className="flex gap-2">
                <img src="/svg/timesheet_app/not_approved_btn.svg" alt="not_approved" className="cursor-pointer" onClick={() => { handleStatus('not') }} />
                <img src="/svg/timesheet_app/approved_btn.svg" alt="approved" className="cursor-pointer" onClick={() => { handleStatus('approved') }} />
            </div>
        );
    } else if (status === 'not') {
        return (
            <div className="flex gap-2">
                <img src="/svg/timesheet_app/under_review_btn.svg" alt="review" className="cursor-pointer" onClick={() => { handleStatus('review') }} />
                <img src="/svg/timesheet_app/approved_btn.svg" alt="approved" className="cursor-pointer" onClick={() => { handleStatus('approved') }} />
            </div>
        );
    } else {
        return null;
    }
}


export function StatusMessages({ status }: { status: 'approved' | "review" | "not" }) {
    if (status === 'approved') {
        return (
            "Approved"
        );
    } else if (status === 'review') {
        return (
            "Under Review"
        );
    } else if (status === 'not') {
        return (
            "Not Approved"
        );
    } else {
        return null; // Return null if the status does not match any condition
    }
}


//  TimeSheetReviewButtons
export function TimeSheetAllReviewButton({ status = 'not', handleStatus }: { status?: string, handleStatus: (status: "not" | "approved" | "review") => void }) {

    return (
        <div className="grid grid-cols-3 gap-2">
            <img className={`${status == 'not' ? "" : "cursor-pointer opacity-60"} `} src="/svg/timesheet_app/not_approved_btn.svg" alt="not_approved" onClick={() => { handleStatus('not') }} />
            <img className={`${status == 'review' ? "" : "opacity-60 cursor-pointer"}  `} src="/svg/timesheet_app/under_review_btn.svg" alt="review" onClick={() => { handleStatus('review') }} />
            <img className={`${status == 'approved' ? "" : "opacity-60 cursor-pointer"} `} src="/svg/timesheet_app/approved_btn.svg" alt="approved" onClick={() => { handleStatus('approved') }} />
        </div>
    );
}