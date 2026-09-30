<?php

namespace App;

enum JobApplicationStatus: string
{
    case Submitted = 'submitted';
    case Reviewing = 'reviewing';
    case Interview = 'interview';
    case Rejected = 'rejected';
    case Accepted = 'accepted';
}
